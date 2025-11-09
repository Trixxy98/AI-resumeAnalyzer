import {Pool} from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',   
    database: process.env.DB_NAME || 'resumai',
    password: process.env.DB_PASSWORD || 'harith1234',
    port: parseInt(process.env.DB_PORT || '5432'),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;