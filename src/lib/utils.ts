import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária para combinar classes CSS condicionalmente
 * Utiliza clsx para lógica condicional e tailwind-merge para otimizar classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatar moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Formatar data para o padrão brasileiro
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(dateObj)
}

/**
 * Formatar data e hora para o padrão brasileiro
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Gerar ID único simples
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}