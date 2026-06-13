import React from 'react';

/**
 * Reusable TextInput component with label and error display.
 */
export default function TextInput({
    id,
    label,
    type = 'text',
    error,
    icon,
    className = '',
    ...props
}) {
    return (
        <div>
            {label && (
                <label
                    className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-slate-950/40 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-slate-600 transition duration-200 outline-none ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-xs text-rose-500 font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
