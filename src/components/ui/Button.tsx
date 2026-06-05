import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type NativeButtonType = NonNullable<
  ButtonHTMLAttributes<HTMLButtonElement>["type"]
>;

type BaseButtonProps = {
  variant?: ButtonVariant;
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> &
  BaseButtonProps & {
    href?: never;
    type?: NativeButtonType;
  };

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  BaseButtonProps & {
    href: string;
  };

const baseClasses =
  "relative isolate inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full px-6 text-base font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#67e8f9_0%,#c084fc_52%,#f0abfc_100%)] text-[#050611] shadow-[0_0_28px_rgba(34,211,238,0.28)] hover:shadow-[0_0_42px_rgba(217,70,239,0.34)] focus:ring-cyan-200",
  secondary:
    "border border-cyan-300/30 bg-cyan-300/[0.06] text-cyan-50 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)] hover:border-fuchsia-300/45 hover:bg-fuchsia-300/[0.08] focus:ring-fuchsia-200",
  ghost:
    "border border-transparent bg-transparent text-zinc-300 hover:border-cyan-300/20 hover:bg-cyan-300/[0.06] hover:text-cyan-50 focus:ring-cyan-500",
};

function isButtonLinkProps(
  props: ButtonProps | ButtonLinkProps,
): props is ButtonLinkProps {
  return typeof props.href === "string";
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  if (isButtonLinkProps(props)) {
    const { className = "", href, variant = "primary", ...linkProps } = props;
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return <Link className={classes} href={href} {...linkProps} />;
  }

  const {
    className = "",
    type = "button",
    variant = "primary",
    ...buttonProps
  } = props;
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      className={classes}
      type={type}
      {...buttonProps}
    />
  );
}
