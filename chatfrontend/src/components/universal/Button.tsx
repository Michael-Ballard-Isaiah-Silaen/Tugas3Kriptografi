import {twMerge} from "tailwind-merge";

const Button = ({
  children,
  className,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  type?: "reset" | "submit" | "button";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={twMerge(
        `rounded-md bg-[#FF0000] px-6 py-2 text-white duration-100 ease-in hover:bg-[#8B0000]`,
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;
