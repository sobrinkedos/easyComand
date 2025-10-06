import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Label } from '../ui';
import type { StockProduct, StockCategory, Supplier, StockUnit } from '../../hooks/useStock';

interface ProductFormProps {
  product?: StockProduct;
  categories: StockCategory[];
  suppliers: Supplier[];
  units: StockUn