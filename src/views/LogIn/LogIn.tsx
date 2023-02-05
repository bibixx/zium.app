import { requestLogin } from "../../utils/extensionApi";

export const LogIn = () => {
  return (
    <div>
      <button onClick={() => requestLogin()}>Log in to F1.com</button>
      <p>
        F1™ is a registered trademark of Formula One World Championship Limited.
        <br />
        This page is not affiliated, authorized, endorsed by or in any way
        officially associated with Formula One World Championship Limited.
        <br />
        The official F1™ website can be found at{" "}
        <a href="https://www.formula1.com/" target="_blank" rel="noreferrer">
          https://www.formula1.com/
        </a>
      </p>
    </div>
  );
};
