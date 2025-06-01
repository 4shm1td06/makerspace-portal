import React from "react";
import classNames from "classnames";

export const Button = ({
  children,
  onClick,
  className = "",
  variant = "default",
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center px-4 py-2 rounded text-sm font-medium focus:outline-none transition";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={classNames(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
