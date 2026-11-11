
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    // Clear any previously scheduled toast dismissal.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const normalizedType = [
      "success",
      "error",
      "warning",
      "info",
    ].includes(type)
      ? type
      : "success";

    setToast({
      id: Date.now(),
      message: String(message || "Something went wrong."),
      type: normalizedType,
    });

    // Give longer messages additional time to be read.
    const messageLength = String(message || "").length;
    const duration = messageLength > 90 ? 6000 : 4000;

    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, duration);
  }, []);

  const dismissToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast,
      }}
    >
      {children}

      {toast && (
        <div
          key={toast.id}
          className={`custom-toast ${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          <span className="custom-toast-message">
            {toast.message}
          </span>
        </div>
      )}
    </ToastContext.Provider>
  );
};
