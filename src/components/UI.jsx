export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className={`${sizes[size]} border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  )
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      {message && <p className="text-sm text-gray-400 mb-6 max-w-sm">{message}</p>}
      {action}
    </div>
  )
}

export function PageWrapper({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      {children}
    </div>
  )
}
