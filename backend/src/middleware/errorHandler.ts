import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false, 
      error: 'بيانات غير صالحة', 
      details: err.errors.map(e => e.message) 
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'البيانات مسجلة مسبقاً' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
