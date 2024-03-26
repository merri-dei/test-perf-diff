"use client";
import React, { useState } from "react";
import RootLayout from "../layout";

const Users = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.log(error, "error from client");
    }
  };
  return (
    <RootLayout>
      <h1>Here is a List of our Users</h1>
      <form
        className="flex flex-col gap-2 items-center justify-center"
        action=""
        onSubmit={onSubmit}
      >
        <input
          className="border-2 border-zinc-700 px-4 py-2"
          type="text"
          name="name"
          value={formData.name}
          placeholder="name"
          onChange={onChange}
        />
        <input
          className="border-2 border-zinc-700 px-4 py-2"
          type="email"
          name="email"
          value={formData.email}
          placeholder="email"
          onChange={onChange}
        />
        <input
          className="border-2 border-zinc-700 px-4 py-2"
          type="password"
          name="password"
          placeholder="password"
          value={formData.password}
          onChange={onChange}
        />

        <button
          type="submit"
          className="border-2 border-zinc-700 px-4 py-2 bg-green-500 hover:bg-green-500/90"
        >
          Submit
        </button>
      </form>
    </RootLayout>
  );
};

export default Users;
