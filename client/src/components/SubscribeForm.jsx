import React, { useState } from "react";
import api from "../api.js";

export default function SubscribeForm({ inline = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | busy | done | error
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("busy");
    setMessage("");
    try {
      await api.post("/subscribe", { email: value });
      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "done") {
    return (
      <p className="alert alert-success">
        You're subscribed — check your inbox for a welcome email!
      </p>
    );
  }

  return (
    <form
      className={inline ? "subscribe-form subscribe-inline" : "subscribe-form"}
      onSubmit={submit}
    >
      <label className="sr-only" htmlFor="subscribe-email">
        Email address
      </label>
      <input
        id="subscribe-email"
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "busy"}
      />
      <button
        className="btn btn-primary"
        type="submit"
        disabled={status === "busy"}
      >
        {status === "busy" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "error" && <p className="field-error">{message}</p>}
    </form>
  );
}
