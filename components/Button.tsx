import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-bold uppercase tracking-wide rounded-xl
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2
    dark:focus-visible:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;

  const variants = {
    primary: `
      bg-orange-600 text-white hover:bg-orange-700 
      shadow-md hover:shadow-lg hover:shadow-orange-500/30
    `,
    secondary: `
      bg-slate-100 text-slate-900 hover:bg-slate-200
      dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700
      border border-slate-200 dark:border-slate-700
    `,
    ghost: `
      bg-transparent text-slate-700 hover:bg-slate-100
      dark:text-slate-300 dark:hover:bg-slate-800
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700
      shadow-md hover:shadow-lg hover:shadow-red-500/30
    `,
  };

  const sizes = {
    sm: 'px-3 py-2 text-[10px] min-h-[36px]',
    md: 'px-5 py-3 text-xs min-h-[44px]',
    lg: 'px-6 py-4 text-sm min-h-[52px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </button>
  );
};

export default Button;
