"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

const Signup = () => {
  const router = useRouter();

  // Form Hook for SignUp
  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    setValue: setSignUpValue,
    formState: { errors: errorsSignUp },
    control: controlSignUp,
  } = useForm();

  const submitSignUp = () => {
    router.replace("/login");
  };

  return (
    <section className="app-background">
      <article className="">
        <h2 className="text-4xl text-white font-bold">Sign Up to NexusPay</h2>
        <h4 className="text-white my-5">
          Enter your Details to SignUp to NexusPay
        </h4>
        <form onSubmit={handleSubmitSignUp(submitSignUp)}>
          <span className="flex flex-col">
            <label
              htmlFor="userName"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              User Name
            </label>
            <input
              {...registerSignUp("userName")}
              type="number"
              placeholder="Enter your User Name"
              className="p-3 rounded-full text-sm"
            />
          </span>
          <span className="flex flex-col">
            <label
              htmlFor="phoneNumber"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              Phone Number eg (+254720****20)
            </label>
            <span className="flex">
              <h4 className="p-3 rounded-full bg-white mr-1 text-sm font-semibold">
                +254
              </h4>
              <input
                {...registerSignUp("phoneNumber")}
                type="number"
                placeholder="Enter your Phone Number"
                className="p-3 rounded-full text-sm w-full"
              />
            </span>
          </span>
          <span className="flex flex-col ">
            <label
              htmlFor="password"
              className="text-[#909090] p-1 text-sm mt-4"
            >
              Password
            </label>
            <input
              {...registerSignUp("password")}
              type="password"
              placeholder="Enter your Password"
              className="p-3 rounded-full text-sm"
            />
          </span>
          <span className="flex justify-end mb-5">
            <h5 className="text-[#909090] p-1 text-sm mt-4 font-semibold">
              Forgot Password?
            </h5>
          </span>
          <input
            type="submit"
            value="Connect"
            className="bg-white p-3 rounded-full font-bold w-full cursor-pointer"
          />
        </form>
      </article>
    </section>
  );
};

export default Signup;
