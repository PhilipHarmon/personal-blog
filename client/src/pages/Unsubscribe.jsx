import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api.js";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("busy"); // busy | done | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .get(`/subscribe/unsubscribe/${token}`)
      .then(() => setStatus("done"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="narrow">
      <h1>Unsubscribe</h1>
      {status === "busy" && <p className="muted">One moment…</p>}
      {status === "done" && (
        <>
          <p className="alert alert-success">
            You're unsubscribed. You won't get any more emails from Mindless
            Musings.
          </p>
          <p>
            Changed your mind? <Link to="/subscribe">Resubscribe here</Link>.
          </p>
        </>
      )}
      {status === "error" && (
        <p className="alert alert-error">
          This unsubscribe link is invalid or has already been used.{" "}
          <Link to="/">Back home</Link>.
        </p>
      )}
    </div>
  );
}
