import { useSession } from "next-auth/react";
import type { AriaRole, ComponentType } from "react";
import React, { Fragment, useEffect } from "react";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Alert } from "@calcom/ui";

type LicenseRequiredProps = {
  as?: keyof JSX.IntrinsicElements | "";
  className?: string;
  role?: AriaRole | undefined;
  children: React.ReactNode;
};

const LicenseRequired = ({ children, as = "", ...rest }: LicenseRequiredProps) => {
  const session = useSession();
  const { t } = useLocale();
  const Component = as || Fragment;
  const hasValidLicense = session.data ? session.data.hasValidLicense : null;

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && hasValidLicense === false) {
      // Informational message in development mode
      console.info(
        `You're using a feature that requires a valid license. Please go to ${WEBAPP_URL}/auth/setup to enter a license key.`
      );
    }
  }, []);

  return (
    <Component {...rest}>
      {hasValidLicense === null || hasValidLicense ? (
        children
      ) : (
        /** Allow the feature to be displayed even if the license is invalid */
        <>
          <Alert
            className="mb-4"
            severity="warning"
            title={
              <>
                {t("enterprise_license_locally")} {t("enterprise_license_sales")}{" "}
                <a className="underline" href="https://cal.com/sales">
                  {t("contact_sales")}
                </a>
              </>
            }
          />
          {children}
        </>
      )}
    </Component>
  );
};

export const withLicenseRequired =
  <T extends JSX.IntrinsicAttributes>(Component: ComponentType<T>) =>
  // eslint-disable-next-line react/display-name
  (hocProps: T) =>
    (
      <LicenseRequired>
        <Component {...hocProps} />
      </LicenseRequired>
    );

export default LicenseRequired;
