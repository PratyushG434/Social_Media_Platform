"use client";

import { useState } from "react";
import API from "../service/api";
import { useNavigate } from "react-router-dom";
import { useNotifications , NotificationProvider} from "./Notification-system";
// TODO: adjust this import to match your auth store hook location
import { useAuthStore } from "../store/useAuthStore";

const  RegisterContent = () => {
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    username: "",
    password: "",
    confirmPassword: "",
    dob: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { login, isLoggingIn, authUser } = useAuthStore();
  const { addNotification } = useNotifications();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await API.registerUser({
        email : formData.email,
        username: formData.username,
        password : formData.password,
        dob : formData.dob,
        display_name : formData.displayName
      });
      const mongoUser = response?.data?.user;

      if (!mongoUser) {
        throw new Error("Invalid signup response");
      }

      // send data to auth store (login the user)
      await login(mongoUser);

      // notify and navigate
      addNotification({
        type: "success",
        title: "Signed Up",
        message: "Account created successfully. Redirecting to Dashboard...",
      });

      setSuccess(true);

      // short delay then navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (err) {
      const message = err?.message || "Registration failed";
      setError(message);
      addNotification({
        type: "error",
        title: "Registration Error",
        message,
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-primary mb-2">Account Created!</h2>
            <p className="text-muted-foreground">Redirecting to Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Join SocialApp</h1>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-card-foreground mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-card-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-card-foreground mb-2">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && <div className="text-destructive text-sm text-center">{error}</div>}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-primary hover:underline">
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <NotificationProvider>
      <RegisterContent />
    </NotificationProvider>
  );
}