import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { Storage } from "@plasmohq/storage";

import { App } from "./App";
import db from "./utils/db";
import { getPathnameSegments } from "./utils/pathname";

const storage = new Storage({
  area: "local",
});

export const AppWrapper = () => {
  const authQuery = db.useAuth();

  const urlQuery = useQuery({
    queryKey: [""],
    queryFn: async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      if (tab?.url === undefined) {
        throw new Error("tab.url is undefined");
      }

      return new URL(tab.url);
    },
  });

  useEffect(() => {
    chrome.runtime.connect({ name: "popup" });
  }, []);

  useEffect(() => {
    storage.set("userRefreshToken", authQuery.user?.refresh_token);
  }, [authQuery.user?.refresh_token]);

  if (urlQuery.isPending || authQuery.isLoading) {
    return <></>;
  }

  if (urlQuery.isError || authQuery.error) {
    return [urlQuery.error?.message, authQuery.error?.message]
      .filter((x) => x !== undefined)
      .join(",");
  }

  if (!authQuery.user) {
    return (
      <div style={{ width: "500px" }}>
        <Login />
      </div>
    );
  }

  return (
    <App
      user={authQuery.user}
      channels={getPathnameSegments(urlQuery.data.pathname).reduce(
        (acc, curr) => [...acc, acc[acc.length - 1] + curr],
        [urlQuery.data.hostname],
      )}
    />
  );
};

function Login() {
  const [sentEmail, setSentEmail] = useState("");
  return (
    <div style={authStyles.container}>
      {!sentEmail ? (
        <Email setSentEmail={setSentEmail} />
      ) : (
        <MagicCode sentEmail={sentEmail} />
      )}
    </div>
  );
}

function Email({
  setSentEmail,
}: {
  setSentEmail: Dispatch<SetStateAction<string>>;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSentEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert("Uh oh :" + err.body?.message);
      setSentEmail("");
    });
  };

  return (
    <form onSubmit={handleSubmit} style={authStyles.form}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Let's log you in!</h2>
      <div>
        <input
          style={authStyles.input}
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" style={authStyles.button}>
          Send Code
        </button>
      </div>
    </form>
  );
}

function MagicCode({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      alert("Uh oh :" + err.body?.message);
      setCode("");
    });
  };

  return (
    <form onSubmit={handleSubmit} style={authStyles.form}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>
        Okay, we sent you an email! What was the code?
      </h2>
      <div>
        <input
          style={authStyles.input}
          type="text"
          placeholder="123456..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button type="submit" style={authStyles.button}>
        Verify
      </button>
    </form>
  );
}

const authStyles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  input: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    width: "300px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
