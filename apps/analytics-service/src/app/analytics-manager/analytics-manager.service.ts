import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BookingEventDto } from './dto/booking-event-dto';
import { LambdaService } from 'libs/lambda-manager-analytics/src/lib/lambda.service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
import { Database } from 'duckdb-async';
import * as parquet from '@dsnp/parquetjs';
import { MetricsDto } from './dto/metrics-dto';
import { createObjectCsvStringifier } from 'csv-writer';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsManagerService {
  private readonly logger = new Logger();

  constructor(
    @Inject('ADMIN_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly lambdaService: LambdaService,
    private readonly s3Service: S3Service
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('get-all-services-for-analytics');
    await this.kafkaClient.connect();
  }

  helloWorld() {
    return {
      status: 200,
      message: 'Hello World 🙈',
    };
  }

  async processBookingEvent(bookingEventDto: BookingEventDto) {
    Logger.log('🦆 Start processing reservation', bookingEventDto);
    try {
      const response$ = this.kafkaClient.send(
        'get-all-services-for-analytics',
        { salon_id: bookingEventDto.salon_id }
      );
      const response = await firstValueFrom(response$); // Obtén el resultado del Kafka

      Logger.log(
        '📥 Respuesta recibida desde Kafka:',
        JSON.stringify(response)
      );

      // Buscar la subcategoría específica por service_id
      let serviceName = 'Unknown Service';
      let servicePrice = 0;

      // Recorrer la respuesta para encontrar la subcategoría
      for (const category of response) {
        for (const subcategory of category.subcategories) {
          if (subcategory.id === bookingEventDto.service_id) {
            serviceName = subcategory.name;
            servicePrice = subcategory.price;
            break;
          }
        }
      }

      const payload = {
        booking_id: bookingEventDto._id,
        booking_date: `${bookingEventDto.booking_date}T${bookingEventDto.time_slot}:00`,
        status: bookingEventDto.status,
        user_id: bookingEventDto.user_id,
        salon_id: bookingEventDto.salon_id,
        payment_id: bookingEventDto.payment_id,
        service_id: bookingEventDto.service_id,
        service_name: serviceName,
        price: servicePrice,
      };

      this.lambdaService.invokeLambda(payload);
      return {
        processedData: payload,
      };
    } catch (error) {
      Logger.error('🔴 Error al procesar el evento en Kafka:', error.message);
      return {
        processedData: 'ERROR: ' + error.message,
      };
    }
  }

  async getData(metricDto: MetricsDto) {
    try {
      const startDate = new Date(metricDto.start_date);
      const endDate = new Date(metricDto.end_date);
      const salonId = metricDto.salon_id;

      this.logger.log(startDate, endDate);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      this.logger.log(
        `⚡ Obtaining data from ${startDate.toDateString()} to ${endDate.toDateString()}`
      );

      const files = await this.s3Service.listFiles();
      const parquetFiles = files.filter((file) => file.endsWith('.parquet'));

      // Filtrar archivos por fecha en el nombre
      const filteredFiles = parquetFiles.filter((fileKey) => {
        const dateMatch = fileKey.match(/(\d{4}-\d{2}-\d{2})/); // Captura la fecha en el formato YYYY-MM-DD
        if (!dateMatch) return false;
        const fileDate = new Date(dateMatch[0]);
        return fileDate >= startDate && fileDate < endDate;
      });

      if (parquetFiles.length === 0) {
        this.logger.error(
          `🔴 No se encontraron archivos Parquet en el bucket S3 bajo el prefijo especificado.`
        );
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Iniciar conexión a DuckDB en memoria
      const db = await Database.create(':memory:');

      const tables = [];
      for (const fileKey of filteredFiles) {
        const fileContent = await this.s3Service.getFile(fileKey);
        const reader = await parquet.ParquetReader.openBuffer(fileContent);

        const rows = [];
        const cursor = reader.getCursor();
        let record;
        while ((record = await cursor.next())) {
          rows.push(record);
        }
        await reader.close();

        tables.push(rows);
      }

      // Conectar a DuckDB
      const connection = await db.connect();
      await connection.run(`
        CREATE TABLE parquet_data (
            booking_id STRING,
            booking_date TIMESTAMP,
            status STRING,
            user_id STRING,
            salon_id INTEGER,
            payment_id STRING,
            service_id INTEGER,
            service_name STRING,
            price FLOAT
          )
      `);

      for (const table of tables) {
        for (const row of table) {
          const values = Object.values(row)
            .map((value) => {
              if (value instanceof Date) {
                // Convertir fecha al formato YYYY-MM-DD HH:MM:SS
                return `'${value
                  .toISOString()
                  .slice(0, 10)
                  .replace('T', ' ')}'`;
              } else if (typeof value === 'string') {
                // Escapar comillas simples en cadenas
                return `'${value.replace(/'/g, "''")}'`;
              }
              return value;
            })
            .join(', ');

          await connection.run(`INSERT INTO parquet_data VALUES (${values})`);
        }
      }

      const temp_date = new Date();
      temp_date.setDate(endDate.getDate() + 1);

      const totalResult = await connection.all(`
        SELECT 
          SUM(price) AS total_price,
          CAST(COUNT(*) AS INTEGER) AS total_quantity
        FROM parquet_data
        WHERE 
          salon_id = ${salonId}
      `);

      const dailyResult = await connection.all(`
        SELECT 
          strftime('%Y-%m-%d', booking_date) AS date,
          CAST(COUNT(*) AS INTEGER) AS quantity, 
          SUM(price) AS amount
          FROM parquet_data
        WHERE 
          salon_id = ${salonId} 
          GROUP BY date
          ORDER BY date
      `);

      // Formatear el resultado final
      const formattedResult = {
        ...totalResult[0],
        data: dailyResult.map((row) => ({
          date: row.date,
          total_quantity: row.quantity ?? 0,
          total_amount: parseFloat(row.amount.toFixed(2)) ?? 0,
        })),
      };

      this.logger.log(`⚡ Data processed successfully.`);

      return {
        statusCode: 200,
        body: { ...formattedResult },
      };
    } catch (error) {
      this.logger.error('🔴 Error processing files:', error);
      throw new InternalServerErrorException('Error processing files');
    }
  }

  async downloadData(metricDto: MetricsDto) {
    const startDate = new Date(metricDto.start_date);
    const endDate = new Date(metricDto.end_date);
    const salonId = metricDto.salon_id;

    this.logger.log(
      `📂 Downloading data from ${startDate.toDateString()} to ${endDate.toDateString()}`
    );

    const files = await this.s3Service.listFiles();
    const parquetFiles = files.filter((file) => file.endsWith('.parquet'));

    // Filtrar archivos por fecha en el nombre
    const filteredFiles = parquetFiles.filter((fileKey) => {
      const dateMatch = fileKey.match(/(\d{4}-\d{2}-\d{2})/); // Captura la fecha en el formato YYYY-MM-DD
      if (!dateMatch) return false;
      const fileDate = new Date(dateMatch[0]);
      return fileDate >= startDate && fileDate <= endDate;
    });

    if (parquetFiles.length === 0) {
      this.logger.error(
        `🔴 No se encontraron archivos Parquet en el bucket S3 bajo el prefijo especificado.`
      );
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const allRows = [];

    for (const fileKey of filteredFiles) {
      const fileContent = await this.s3Service.getFile(fileKey);
      const reader = await parquet.ParquetReader.openBuffer(fileContent);

      const cursor = reader.getCursor();
      let record;
      while ((record = await cursor.next())) {
        // Filtrar por fecha y salon_id directamente al procesar
        const recordDate = new Date(record.booking_date);
        if (
          recordDate >= startDate &&
          recordDate <= endDate &&
          record.salon_id === salonId
        ) {
          allRows.push(record);
        }
      }
      await reader.close();
    }

    if (allRows.length === 0) {
      this.logger.error(
        `🔴 No se encontraron datos que cumplan con los filtros.`
      );
      throw new HttpException('No se encontraron datos.', HttpStatus.NOT_FOUND);
    }

    // Convertir datos a CSV
    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(allRows[0]).map((key) => ({ id: key, title: key })),
    });

    const csvContent =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(allRows);

    this.logger.log(`📂 Data successfully converted to CSV format.`);

    // Retornar como archivo CSV
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="data.csv"',
      },
      body: csvContent,
    };
  }
  catch(error) {
    this.logger.error('🔴 Error processing files:', error);
    throw new InternalServerErrorException('Error processing files');
  }
}
