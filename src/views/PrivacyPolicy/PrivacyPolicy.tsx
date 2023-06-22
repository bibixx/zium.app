import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { CookieBanner } from "../../components/CookieBanner/CookieBanner";
import { Logo } from "../../components/Logo/Logo";
import { useTrackWithTitle } from "../../hooks/useAnalytics/useAnalytics";
import styles from "./PrivacyPolicy.module.scss";

export const PrivacyPolicy = () => {
  useTrackWithTitle("Privacy Policy");

  return (
    <main className={styles.wrapper}>
      <Button variant="Secondary" iconLeft={ArrowLeftIcon} as={Link} to="/">
        Back to Zium
      </Button>

      <h1>
        <span>Privacy Policy</span>
        <Logo className={styles.logo} height={40} aria-hidden />
      </h1>

      <div className={styles.lastUpdated}>Last update: Jun 22, 2023</div>

      <p>
        We take your privacy seriously. This privacy policy explains how we collect, use, and protect your personal
        information.
      </p>

      <h2>Information we collect</h2>

      <p>
        We use Matomo to collect analytics data on our website. This includes information such as your IP address,
        browser type, device type, and pages visited. This information is used to analyze website traffic and improve
        our website.
      </p>

      <p>
        Login information is stored and used solely on your device. No passwords, personal data, or payment information
        is sent to zium.app servers.
      </p>

      <h2>Use of cookies</h2>

      <p>
        We use cookies to collect analytics data and improve your browsing experience. Cookies are small files that are
        stored on your device when you visit our website. You can control the use of cookies through your browser
        settings.
      </p>

      <h2>Data sharing</h2>

      <p>We do not share your personal information with third parties.</p>

      <h2>Your rights</h2>

      <p>
        You have the right to access, correct, and delete your personal information. You can contact us at any time to
        exercise these rights at <a href="mailto:zium@zium.app">zium@zium.app</a>.
      </p>

      <h2>Changes to this policy</h2>

      <p>
        We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy
        on our website.
      </p>

      <p>
        If you have any questions or concerns about our privacy policy, please contact us at{" "}
        <a href="mailto:zium@zium.app">zium@zium.app</a>.
      </p>
      <CookieBanner position="bottom" mode="fixed" />
    </main>
  );
};
