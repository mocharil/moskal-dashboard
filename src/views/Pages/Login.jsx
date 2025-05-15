import { useState } from "react";
import { useSnackbar } from "notistack";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Checkbox from "@mui/joy/Checkbox";

import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";

import CustomText from "../../components/CustomText";

import "./styles/Login.css";
import CustomButton from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { login } from "../../helpers/redux/slice/loginSlice";
import authService from "../../services/authService";

import {
  addKeywords,
  setActiveKeyword,
} from "../../helpers/redux/slice/keywordSlice";
import { getProjects } from "../../services/projectService";

const Login = () => {
  const navigate = useNavigate(); // Initialize navigation function
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isSignIn, setIsSignIn] = useState(true);

  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [isRememberChecked, setIsRememberChecked] = useState(false);

  const [isLoginError, setIsLoginError] = useState(false);
  const [isButtonLoginLoading, setIsButtonLoginLoading] = useState(false);

  const [nameRegister, setNameRegister] = useState("");
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const [isButtonRegisterLoading, setIsButtonRegisterLoading] = useState(false);

  const handleOnChangeEmailLogin = (event) => {
    setEmailLogin(event.target.value);
  };

  const handleOnChangePasswordLogin = (event) => {
    setPasswordLogin(event.target.value);
  };

  const handleOnChangeRemember = (event) => {
    setIsRememberChecked(event.target.value);
  };

  const handleOnChangeNameRegister = (event) => {
    setNameRegister(event.target.value);
  };

  const handleOnChangeEmailRegister = (event) => {
    setEmailRegister(event.target.value);
  };

  const handleOnChangePasswordRegister = (event) => {
    setPasswordRegister(event.target.value);
  };

  const handleLogin = async () => {
    try {
      setIsButtonLoginLoading(true);
      const data = await authService.login(emailLogin, passwordLogin);
      console.log("Login API response:", data);
      
      // Check if user object exists
      if (!data.user) {
        console.error("User object is missing in the API response:", data);
      enqueueSnackbar("Login failed: Invalid API response format", { variant: "error" });
        setIsButtonLoginLoading(false);
        return;
      }
      
      const { access_token, refresh_token, token_type, user } = data;
      
      // Verify user object has required properties
      if (!user.name || !user.email || !user.id) {
        console.error("User object is missing required properties:", user);
      enqueueSnackbar("Login failed: Missing user information", { variant: "error" });
        setIsButtonLoginLoading(false);
        return;
      }

      // Example: store in Redux (or local state)
      dispatch(
        login({
          name: user.name,
          email: user.email,
          token: access_token,
          refreshToken: refresh_token,
          tokenType: token_type,
          userId: user.id,
          expiresInDays: isRememberChecked ? 30 : 1,
        })
      );
      enqueueSnackbar("Login Success", { variant: "success" });
      setIsButtonLoginLoading(false);
      checkProject();
    } catch (error) {
      const errorDetail = error?.detail;
      console.log("error", error);
      console.log("error detail", errorDetail);

      if (errorDetail === "Incorrect email or password") {
        enqueueSnackbar("Email or password is incorrect.", { variant: "error" });
        setIsLoginError(true);
      } else if (errorDetail === "Please verify your email first") {
        enqueueSnackbar("Please verify your email before logging in.", { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
        console.error("Login failed:", error);
      }
      setIsButtonLoginLoading(false);
    }
  };

  const checkProject = async () => {
    try {
      const project = await getProjects();
      console.log(project.owned_projects);
      console.log(project.accessible_projects);
      if (
        project.accessible_projects.length > 0 ||
        project.owned_projects.length > 0
      ) {
        dispatch(
          addKeywords({
            keywords: [
              ...project.accessible_projects,
              ...project.owned_projects,
            ],
            days: 30,
          })
        );

        dispatch(
          setActiveKeyword({
            activeKeyword: project.owned_projects[0]
              ? project.owned_projects[0]
              : project.accessible_projects[0],
            days: 30,
          })
        );
        navigate(
          `/${
            project.owned_projects[0]
              ? project.owned_projects[0].name
              : project.accessible_projects[0].name
          }/dashboard`,
          { replace: true }
        );
      } else {
        navigate("/onboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegister = async () => {
    try {
      setIsButtonRegisterLoading(true);
      const data = await authService.register(
        emailRegister,
        nameRegister,
        passwordRegister
      );
      console.log("Register success:", data);
      enqueueSnackbar("Login Success", { variant: "success" });
      setIsButtonRegisterLoading(false);
      handleChangeToLogin();
    } catch (error) {
      console.error("Register failed:", error);

      const res = error?.response;

      if (res?.status === 422 && Array.isArray(res.data?.detail)) {
        // Extract validation message(s)
        const firstError = res.data.detail[0];
        const message = firstError?.msg || "Validation failed.";

        enqueueSnackbar(message, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
        console.error("Register error:", error);
      }
      setIsButtonRegisterLoading(false);
    }
  };

  const handleChangeToLogin = () => {
    setIsSignIn(true);
    setNameRegister("");
    setEmailRegister("");
    setPasswordRegister("");
    setIsButtonRegisterLoading(false);
  };

  const handleChangeToRegister = () => {
    setIsSignIn(false);
    setEmailLogin("");
    setPasswordLogin("");
    setIsLoginError(false);
    setIsButtonLoginLoading(false);
  };

  const isButtonRegisterDisabled = () => {
    return (
      nameRegister.trim() === "" ||
      emailRegister.trim() === "" ||
      passwordRegister.trim() === ""
    );
  };

  const isButtonLoginDisabled = () => {
    return emailLogin.trim() === "" || passwordLogin.trim() === "";
  };

  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <img
            className="login-moskal-icon"
            src={window.location.origin + "/MOSKAL.svg"}
          />
          {isSignIn ? (
            <>
              <div>
                <CustomText size="s" bold="semibold" color="b900">
                  Welcome Back
                </CustomText>
                <CustomText size="xls" color="b600 " inline>
                  Please enter your account details to sign in.
                </CustomText>
              </div>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Email
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Enter your email business email"
                  value={emailLogin}
                  onChange={handleOnChangeEmailLogin}
                  error={isLoginError}
                />
                {isLoginError && (
                  <FormHelperText>
                    <CustomText color="r600" inline>
                      Please check your email address and try again
                    </CustomText>
                  </FormHelperText>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Password
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="********"
                  type="password"
                  value={passwordLogin}
                  onChange={handleOnChangePasswordLogin}
                  error={isLoginError}
                />
                {isLoginError && (
                  <FormHelperText>
                    <CustomText color="r600" inline>
                      Please check your password address and try again
                    </CustomText>
                  </FormHelperText>
                )}
              </FormControl>
              <div className="login-remember">
                <div className="login-remember-checkbox-container">
                  <Checkbox
                    value={isRememberChecked}
                    onChange={handleOnChangeRemember}
                  />
                  <CustomText size="2xls" inline>
                    Remember for 30 days
                  </CustomText>
                </div>
                <CustomText
                  size="2xls"
                  color="brand"
                  bold="semibold"
                  inline
                  pointer
                  onClick={() => window.location.href = "https://login.moskal.id/forgot-password"}
                >
                  Forgot Password
                </CustomText>
              </div>
              <CustomButton
                onClick={handleLogin}
                disabled={isButtonLoginDisabled()}
                loading={isButtonLoginLoading}
              >
                Sign in{" "}
              </CustomButton>
              <div className="login-bottom-text-container">
                <CustomText size="2xls" inline>
                  Don't have account?
                </CustomText>
                <CustomText
                  size="2xls"
                  color="brand"
                  bold="semibold"
                  inline
                  pointer
                  onClick={handleChangeToRegister}
                >
                  Sign up
                </CustomText>
              </div>
            </>
          ) : (
            <>
              <div>
                <CustomText size="s" bold="semibold" color="b900">
                  Welcome Back
                </CustomText>
                <CustomText size="xls" color="b600 " inline>
                  Sign up in less than 2 minutes.
                </CustomText>
              </div>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Name
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Enter your name"
                  value={nameRegister}
                  onChange={handleOnChangeNameRegister}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Email
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Enter your email"
                  value={emailRegister}
                  onChange={handleOnChangeEmailRegister}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Password
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Create a password"
                  type="password"
                  value={passwordRegister}
                  onChange={handleOnChangePasswordRegister}
                />
                <FormHelperText>Must be at least 8 characters. </FormHelperText>
              </FormControl>

              <CustomButton
                disabled={isButtonRegisterDisabled()}
                onClick={handleRegister}
                loading={isButtonRegisterLoading}
              >
                Get Started
              </CustomButton>

              <div className="login-bottom-text-container">
                <CustomText size="2xls" inline>
                  Already have an account?
                </CustomText>
                <CustomText
                  size="2xls"
                  color="brand"
                  bold="semibold"
                  inline
                  pointer
                  onClick={handleChangeToLogin}
                >
                  Log in
                </CustomText>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
