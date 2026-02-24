export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[92rem] px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
