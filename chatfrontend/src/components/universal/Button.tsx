import {twMerge} from "tailwind-merge";

const Button = ({
  children,
  className,
  type = "submit",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "reset" | "submit" | "button";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        `rounded-md bg-[#FF0000] px-6 py-2 text-white duration-100 ease-in hover:bg-[#8B0000] disabled:cursor-not-allowed disabled:bg-red-400 disabled:opacity-70`,
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;