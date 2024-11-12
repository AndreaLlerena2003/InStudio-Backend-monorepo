import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BookingEventDto } from './dto/booking-event-dto';
import { LambdaService } from 'libs/lambda-manager-analytics/src/lib/lambda.service';
import { S3Service } from 'libs/s3-manager/src/lib/s3-manager.service';
import { Database } from 'duckdb-async';
import { format } from 'date-fns';
import * as parquet from '@dsnp/parquetjs';
import { MetricsDto } from './dto/metrics-dto';

@Injectable()
export class AnalyticsManagerService {
  constructor(
    private readonly lambdaService: LambdaService,
    private readonly s3Service: S3Service
  ) {}

  helloWorld() {
    return {
      status: 200,
      message: 'Hello World 🙈',
    };
  }

  processBookingEvent(bookingEventDto: BookingEventDto): {} {
    this.lambdaService.invokeLambda(bookingEventDto);
    return {
      processedData: bookingEventDto,
    };
  }

  async getData(metricDto: MetricsDto) {
    try {
      const startDate = new Date(metricDto.start_date);
      const endDate = new Date(metricDto.end_date);
      console.log(`Filtrando datos desde ${startDate} hasta ${endDate}`);

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
        return {
          statusCode: 404,
          body: JSON.stringify(
            'No se encontraron archivos Parquet en el bucket S3 bajo el prefijo especificado.'
          ),
        };
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
            booking_id INT,
            booking_date TIMESTAMP,
            status INT,
            user_id INT,
            salon_id INT,
            employee_id INT,
            payment_id INT,
            district_id INT,
            service_id INT,
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
                  .slice(0, 19)
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

      // Ejecutar la consulta SQL
      const result = await connection.all(`
        SELECT SUM(price) AS total_price,
        COUNT(*) AS quantity
        FROM parquet_data
        WHERE booking_date >= '${metricDto.start_date}' AND booking_date <= '${metricDto.end_date}'
      `);

      const result2 = await connection.all(`
          SELECT 
              strftime('%Y-%m-%d', booking_date) AS day, 
              COUNT(*) AS quantity, 
              SUM(price) AS amount
          FROM parquet_data
          WHERE booking_date >= '${metricDto.start_date}' AND booking_date <= '${metricDto.end_date}'
          GROUP BY day
          ORDER BY day
      `);
      // Map over the results to handle BigInt values and format the output
      const formattedResult = result2.map((row) => {
        const date = new Date(row.day); // Convert "YYYY-MM-DD" to a Date object

        return {
          date: date,
          quantity:
            typeof row.quantity === 'bigint'
              ? parseInt(row.quantity.toString())
              : row.quantity,
          amount:
            typeof row.amount === 'bigint'
              ? parseFloat(row.amount.toString())
              : row.amount,
        };
      });

      console.log(JSON.stringify(formattedResult, null, 2));

      // Retornar el resultado de la consulta
      const res = result.map((item) =>
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [
            key,
            typeof value === 'bigint' ? value.toString() : value,
          ])
        )
      );

      const final_res = {
        ...res[0],
        data: { ...formattedResult },
      };

      return {
        statusCode: 200,
        body: final_res,
      };
    } catch (error) {
      console.error('Error processing files:', error);
      throw new InternalServerErrorException('Error processing files');
    }
  }
}
