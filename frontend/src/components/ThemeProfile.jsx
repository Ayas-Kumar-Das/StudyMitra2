import { useState } from "react";
import { Sun, Moon, UserCircle, X } from "@phosphor-icons/react";
import Modal from "./Modal";
import IconButton from "./IconButton";
import { readSaved, save } from "../lib/utils";
export default function ThemeProfile({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(() => readSaved("sm-profile-name", "")),
    [error, setError] = useState("");
  return (
    <>
      <div
        className="theme-profile glass-panel"
        role="group"
        aria-label="Theme and profile"
      >
        <button
          className="shell-tool-button"
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <span className="tool-separator" aria-hidden="true" />
        <button
          className="shell-tool-button"
          aria-label="Open profile"
          title="Your profile"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          <UserCircle size={22} />
        </button>
      </div>
      {open && (
        <Modal
          className="profile-dialog"
          label="Your profile"
          close={() => setOpen(false)}
        >
          <div className="section-heading">
            <h2>Your profile</h2>
            <IconButton label="Close profile" onClick={() => setOpen(false)}>
              <X size={20} />
            </IconButton>
          </div>
          <p className="muted">Personalize this study space on this browser.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (save("sm-profile-name", name.trim())) {
                setName(name.trim());
                setOpen(false);
              } else
                setError(
                  "Your browser could not save this name. Please try again.",
                );
            }}
          >
            <label>
              Display name
              <input
                name="display_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                maxLength={60}
                autoComplete="nickname"
              />
            </label>
            <p className="profile-note">
              This profile is stored on this device.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="primary">Save profile</button>
          </form>
        </Modal>
      )}
    </>
  );
}
