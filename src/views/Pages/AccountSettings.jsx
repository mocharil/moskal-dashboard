import { useEffect, useState } from "react";
import CustomText from "../../components/CustomText";
import { ChevronLeft } from "@mui/icons-material";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import "./styles/AccountSetting.css";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import CustomButton from "../../components/CustomButton";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../../helpers/redux/slice/loginSlice";
import { useNavigate } from "react-router-dom";
import { deleteKeywords } from "../../helpers/redux/slice/keywordSlice";
import { deleteTopics } from "../../helpers/redux/slice/topicSlice";
import authService from "../../services/authService";
import { enqueueSnackbar } from "notistack";
import { Dialog, Radio } from "@mui/material";

import { Button } from "@mui/joy";

const AccountSettings = () => {
  const [page, setPage] = useState("main");
  const changePage = (page) => {
    setPage(page);
  };
  const changeToMain = () => {
    setPage("main");
  };

  const getPage = () => {
    if (page === "main") {
      return <MainPage changePage={changePage} />;
    } else if (page === "facebook") {
      return (
        <>
          <MenuHeader changePage={changePage} />
          <FacebookAndInstagram />
        </>
      );
    } else if (page === "linkedin") {
      return (
        <>
          <MenuHeader changePage={changePage} />
          <LinkedIn />
        </>
      );
    } else if (page === "userManagement") {
      return (
        <>
          <MenuHeader changePage={changePage} />
          <UserManagement />
        </>
      );
    } else if (page === "email") {
      return (
        <>
          <MenuHeader changePage={changePage} />
          <EmailChange />
        </>
      );
    } else if (page === "password") {
      return (
        <>
          <MenuHeader changePage={changePage} />
          <PasswordChange handleToMain={changeToMain} />
        </>
      );
    }
  };

  return <>{getPage()}</>;
};

export default AccountSettings;

const MainPage = ({ changePage }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  const handleClickItem = (page) => {
    changePage(page);
  };
  const handleLogout = () => {
    dispatch(logout());
    dispatch(deleteKeywords());
    dispatch(deleteTopics());
    navigate("/");
  };
  return (
    <>
      <div className="account-setting-header">
        <div className="account-setting-header-left">
          <CustomText bold="semibold" color="b900" size="lgs" inline>
            Account settings
          </CustomText>
          <CustomText color="b500" size="2xls" inline>
            {userData.email}
          </CustomText>
        </div>
        <div>
          <CustomButton variant="outlined" onClick={handleLogout}>
            Logout
          </CustomButton>
        </div>
      </div>
      <div className="account-setting-menu-container">
        <CustomText color="b900" size="lgs" bold="semibold" inline>
          Integrations
        </CustomText>
        <div className="account-setting-menu-list">
          <div
            className="account-setting-menu-item"
            onClick={() => handleClickItem("facebook")}
          >
            <img
              className="account-setting-menu-item-icon"
              src={window.location.origin + "/meta.svg"}
            />
            <CustomText color="b900" bold="medium" size="lgs" inline>
              Connect Facebook & Instagram
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              Manage your connected accounts and add new profiles
            </CustomText>
          </div>
          <div
            className="account-setting-menu-item"
            onClick={() => handleClickItem("linkedin")}
          >
            <img
              className="account-setting-menu-item-icon"
              src={window.location.origin + "/linkedin.svg"}
            />
            <CustomText color="b900" bold="medium" size="lgs" inline>
              Connect Linkedin
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              Manage your connected accounted accounts and add new profiles
            </CustomText>
          </div>
        </div>
        <CustomText color="b900" size="lgs" bold="semibold" inline>
          Settings
        </CustomText>
        <div className="account-setting-menu-list">
          <div
            className="account-setting-menu-item"
            onClick={() => handleClickItem("userManagement")}
          >
            <img
              className="account-setting-menu-item-icon"
              src={window.location.origin + "/access.svg"}
            />
            <CustomText color="b900" bold="medium" size="lgs" inline>
              User access management
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              Manage project access privileges to individual users
            </CustomText>
          </div>
          <div
            className="account-setting-menu-item"
            onClick={() => handleClickItem("email")}
          >
            <img
              className="account-setting-menu-item-icon"
              src={window.location.origin + "/email.svg"}
            />
            <CustomText color="b900" bold="medium" size="lgs" inline>
              Change email address
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              Change your email address
            </CustomText>
          </div>
          <div
            className="account-setting-menu-item"
            onClick={() => handleClickItem("password")}
          >
            <img
              className="account-setting-menu-item-icon"
              src={window.location.origin + "/password.svg"}
            />
            <CustomText color="b900" bold="medium" size="lgs" inline>
              Change Password
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              Change Your Password
            </CustomText>
          </div>
        </div>
      </div>
    </>
  );
};

const FacebookAndInstagram = () => {
  return (
    <>
      <div className="account-setting-menu-page">
        <div className="account-setting-integrations-box">
          <div className="account-setting-integrations-content">
            <CustomText
              bold="semibold"
              size="lgs"
              color="b900"
              class="account-setting-integrations-header"
              inline
            >
              Connect Facebook & Instagram to collect public mentions
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              <CustomText bold="semibold" inline>
                Important note:
              </CustomText>
              Moskal is available for instagram Business profiles and Facebook
              pages only. You will be redirected to Facebook Auth where you can
              select the Facebook and Instagram profile you would like to
              connect.
            </CustomText>
            <br />
            <CustomText color="b600" size="2xls">
              Moksal does not collect any personal data. Your integration will
              never used to manage or post to your Facebook Page or Instagram
              Profile
            </CustomText>
            <div className="account-setting-integrations-button">
              Connect Facebook/ Instagram
            </div>
          </div>
          <img
            className="account-setting-integrations-icon"
            src={window.location.origin + "/meta.svg"}
          />
        </div>
      </div>
    </>
  );
};

const LinkedIn = () => {
  return (
    <>
      <div className="account-setting-menu-page">
        <div className="account-setting-integrations-box">
          <div className="account-setting-integrations-content">
            <CustomText
              bold="semibold"
              size="lgs"
              color="b900"
              class="account-setting-integrations-header"
              inline
            >
              Connect Linkedin to collect public mentions
            </CustomText>
            <CustomText color="b600" size="2xls" inline>
              <CustomText bold="semibold" inline>
                Important note:
              </CustomText>
              Moskal is available for Linkedin profiles where connected account
              has superadministrator role with Organization Page you would like
              to monitor. You will be redirected to Linkedin Auth and you have
              to accept requested permissions to allow Moskal collecting
              mentions from your organizations pages.
            </CustomText>
            <br />
            <CustomText color="b600" size="2xls">
              Moksal does not collect any personal data. Your integration will
              never used to manage or post to your Linkedin profile or
              Organization Page.
            </CustomText>
            <div className="account-setting-integrations-button">
              Connect Linkedin
            </div>
          </div>
          <img
            className="account-setting-integrations-icon"
            src={window.location.origin + "/linkedin.svg"}
          />
        </div>
      </div>
    </>
  );
};

const EmailChange = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const [existingEmail, setExistingEmail] = useState(userData.email);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleOnChangeNewEmail = (event) => {
    setNewEmail(event.target.value);
  };

  const handleOnChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const isButtonDisabled = () => {
    return newEmail === "" || password === "" || !isEmailValid();
  };

  const isEmailValid = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(newEmail);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(deleteKeywords());
    dispatch(deleteTopics());
    navigate("/");
  };

  const handleChangeEmail = async () => {
    try {
      const resp = await authService.changeEmail(
        existingEmail,
        password,
        newEmail
      );
      if (resp.status === "success") {
        enqueueSnackbar("Change email success", {
          variant: "success",
        });
      }

      console.log("resp", resp);
      handleLogout();
    } catch (error) {
      const errorDetail = error?.detail;
      console.log(error);
      if (errorDetail === "Current email is incorrect") {
        enqueueSnackbar("Current email is incorrect", {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Something gone wrong", {
          variant: "error",
        });
      }
    }
  };
  return (
    <>
      <div className="account-setting-menu-page">
        <div className="account-setting-change-box">
          <div className="account-setting-change-content">
            <CustomText bold="semibold" size="lgs" color="b900" inline>
              Change email address
            </CustomText>
            <FormControl>
              <FormLabel>
                <CustomText color="b700" size="2xls" bold="medium" inline>
                  Current email address:
                </CustomText>
              </FormLabel>
              <Input value={existingEmail} />
            </FormControl>
            <FormControl>
              <FormLabel>
                <CustomText color="b700" size="2xls" bold="medium" inline>
                  Enter new email address:
                </CustomText>
              </FormLabel>
              <Input
                placeholder="Enter your email"
                value={newEmail}
                onChange={handleOnChangeNewEmail}
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                <CustomText color="b700" size="2xls" bold="medium" inline>
                  Enter current password:
                </CustomText>
              </FormLabel>
              <Input
                placeholder="********"
                type="password"
                value={password}
                onChange={handleOnChangePassword}
              />
            </FormControl>
            <div>
              <CustomButton
                disabled={isButtonDisabled()}
                sx={{ padding: "10px 64px" }}
                onClick={handleChangeEmail}
              >
                Save
              </CustomButton>
            </div>
          </div>
          <img
            className="account-setting-change-icon"
            src={window.location.origin + "/email.svg"}
          />
        </div>
      </div>
    </>
  );
};

const PasswordChange = (props) => {
  const [existingPassword, setExistingPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const handleOnChangeNewPassword = (event) => {
    setNewPassword(event.target.value);
  };

  const handleOnChangeRepeatPassword = (event) => {
    setRepeatPassword(event.target.value);
  };

  const handleOnChangeExistingPassword = (event) => {
    setExistingPassword(event.target.value);
  };

  const handleChangePassword = async () => {
    try {
      const resp = await authService.changePassword(
        existingPassword,
        newPassword
      );
      if (resp.status === "success") {
        enqueueSnackbar("Change password success", {
          variant: "success",
        });
        props.handleToMain();
      }
      console.log("resp", resp);
    } catch (error) {
      const errorDetail = error?.detail;
      console.log(error);
      if (errorDetail === "Incorrect current password") {
        enqueueSnackbar("Incorrect current password", {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Something gone wrong", {
          variant: "error",
        });
      }
    }
  };

  const isButtonDisabled = () => {
    return (
      existingPassword === "" ||
      newPassword === "" ||
      repeatPassword === "" ||
      newPassword !== repeatPassword
    );
  };
  return (
    <>
      <div className="account-setting-menu-page">
        <div className="account-setting-change-box">
          <div className="account-setting-change-content">
            <CustomText bold="semibold" size="lgs" color="b900" inline>
              Change password
            </CustomText>
            <FormControl>
              <FormLabel>
                <CustomText color="b700" size="2xls" bold="medium" inline>
                  Current Password:
                </CustomText>
              </FormLabel>
              <Input
                placeholder="********"
                type="password"
                value={existingPassword}
                onChange={handleOnChangeExistingPassword}
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                <CustomText color="b700" size="2xls" bold="medium" inline>
                  Enter new password:
                </CustomText>
              </FormLabel>
              <Input
                placeholder="********"
                type="password"
                value={newPassword}
                onChange={handleOnChangeNewPassword}
              />
            </FormControl>
            <FormControl>
              <FormLabel>
                <CustomText color="b700" size="2xls" bold="medium" inline>
                  Repeat new password:
                </CustomText>
              </FormLabel>
              <Input
                placeholder="********"
                type="password"
                value={repeatPassword}
                onChange={handleOnChangeRepeatPassword}
              />
            </FormControl>
            <div className="account-setting-change-button-container">
              <CustomButton
                disabled={isButtonDisabled()}
                sx={{ padding: "10px 64px" }}
                onClick={handleChangePassword}
              >
                Save
              </CustomButton>
            </div>
          </div>
          <img
            className="account-setting-change-icon"
            src={window.location.origin + "/password.svg"}
          />
        </div>
      </div>
    </>
  );
};

const UserManagement = () => {
  const listKeywords = useSelector((state) => state.keywords.keywords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogDeleteOpen, setIsDialogDeleteOpen] = useState(false);

  const [listUserGlobal, setListUserGlobal] = useState([]);
  const [listUserIndividual, setListUserIndividual] = useState([]);

  const [activeTab, setActiveTab] = useState("global");

  const [selectedAccessType, setSelectedAccessType] = useState("global");
  const [selectedRoleGlobal, setSelectedRoleGlobal] = useState("standard");
  const [selectedRoleIndividual, setSelectedRoleIndividual] =
    useState("full_access");
  const [selectedProject, setSelectedProject] = useState("");

  const [inputEmail, setInputEmail] = useState("");

  const [deleteUser, setDeleteUser] = useState({});

  useEffect(() => {
    getUserGlobal();
    getUserIndividual();
  }, []);

  const getUserGlobal = async () => {
    try {
      const resp = await authService.getUserListGlobal();
      setListUserGlobal(resp.items);
      console.log(resp);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getUserIndividual = async () => {
    try {
      const resp = await authService.getUserListIndividual();
      setListUserIndividual(resp.items);
      console.log(resp);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const handleChangeAccessType = (event) => {
    setSelectedAccessType(event.target.value);
  };

  const handleChangeRoleGlobal = (event) => {
    setSelectedRoleGlobal(event.target.value);
  };

  const handleChangeRoleIndividual = (event) => {
    setSelectedRoleIndividual(event.target.value);
  };

  const handleSelectProject = (event, newValue) => {
    setSelectedProject(event.target.value);
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChangeEmail = (event) => {
    setInputEmail(event.target.value);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const isEmailValid = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(inputEmail);
  };

  const isButtonDisabled = () => {
    return (
      inputEmail === "" ||
      (setSelectedAccessType === "individual" && selectedProject === "") ||
      isEmailValid() === false
    );
  };

  const handleCreateNewUser = async () => {
    try {
      if (selectedAccessType === "global") {
        const reqBody = {
          user_email: inputEmail,
          role: selectedRoleGlobal,
        };

        const resp = await authService.createUserGlobal(reqBody);
        console.log(resp);
      } else {
        const reqBody = {
          user_email: inputEmail,
          role: selectedRoleIndividual,
          project_id: selectedProject,
        };

        const resp = await authService.createUserIndividual(reqBody);
        console.log(resp);
      }
      enqueueSnackbar("User Created", {
        variant: "success",
      });
      handleCloseDialog();
      getUserGlobal();
      getUserIndividual();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed Create User", {
        variant: "error",
      });
    }
  };

  const handleOpenDialogDelete = (user) => {
    setDeleteUser(user);
    setIsDialogDeleteOpen(true);
  };

  const handleDeleteUser = async (user) => {
    try {
      const reqBody = {
        user_email: user.user_email,
        project_id: user.project_id,
      };
      const resp = await authService.deleteUserAccess(reqBody);
      console.log(resp);
      enqueueSnackbar("User Deleted", {
        variant: "success",
      });
      setIsDialogDeleteOpen(false);
      getUserGlobal();
      getUserIndividual();
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Failed Delete User", {
        variant: "error",
      });
    }
  };
  return (
    <>
      <div className="account-setting-menu-page">
        <div className="account-setting-menu-box">
          <CustomText bold="semibold" size="lgs" color="b900" inline>
            User access management. Current user limit:{" "}
            {activeTab === "global"
              ? listUserGlobal.length
              : listUserIndividual.length}
            /5
          </CustomText>
          <div className="account-setting-menu-box-list-desc">
            <div className="account-setting-menu-box-desc">
              <CustomText color="b500" size="sss" bold="medium" inline>
                Users
              </CustomText>
              <CustomText color="b900" size="2xls" inline>
                One account can be accessed by many users, from administrators
                to observers. The owner of the account has full rights to the
                account.
              </CustomText>
            </div>
            <div className="account-setting-menu-box-desc">
              <CustomText color="b500" size="sss" bold="medium" inline>
                Global account access
              </CustomText>
              <CustomText color="b900" size="2xls" inline>
                Users with full access to the account are authorized to perform
                all actions and set permissions for users and projects within
                the account.
              </CustomText>
            </div>
            <div className="account-setting-menu-box-desc">
              <CustomText color="b500" size="sss" bold="medium" inline>
                Individual project
              </CustomText>
              <CustomText color="b900" size="2xls" inline>
                Access to an individual project allows the user to work only on
                the selected project.
              </CustomText>
            </div>
            <div className="account-setting-menu-box-desc">
              <CustomText color="b500" size="sss" bold="medium" inline>
                Role
              </CustomText>
              <CustomText color="b900" size="2xls" inline>
                Moskal lets account owners set different access role for each
                user.
              </CustomText>
            </div>
          </div>
          <div className="account-setting-menu-box-sub-menu">
            <Tabs
              aria-label="tabs"
              defaultValue={0}
              sx={{
                bgcolor: "transparent",
                margin: "15px 0px",
                width: "fit-content",
              }}
              value={activeTab}
              onChange={handleChangeTab}
            >
              <TabList
                disableUnderline
                sx={{
                  p: 0.5,
                  gap: 0.5,
                  borderRadius: "8px",
                  bgcolor: "background.level1",
                  justifyContent: "space-between",
                  [`& .${tabClasses.root}[aria-selected="true"]`]: {
                    boxShadow: "sm",
                    bgcolor: "background.surface",
                  },
                }}
              >
                <Tab
                  disableIndicator
                  sx={{ width: "fit-content", height: "44px" }}
                  value="global"
                >
                  <CustomText>Global account access</CustomText>
                </Tab>
                <Tab
                  disableIndicator
                  sx={{ width: "fit-content", height: "44px" }}
                  value="individual"
                >
                  <CustomText>Individual project access</CustomText>
                </Tab>
              </TabList>
            </Tabs>
            <CustomButton
              // disabled={isButtonDisabled()}
              onClick={handleOpenDialog}
              sx={{ padding: "10px 64px" }}
            >
              Assign a new user
            </CustomButton>
          </div>
          <table className="most-share-voice-component-table">
            <thead>
              <tr className="most-share-voice-component-table-header">
                {activeTab === "individual" && (
                  <th style={{ textAlign: "left" }}>
                    <CustomText color="b500" size="sss" bold="normal">
                      Project
                    </CustomText>
                  </th>
                )}
                <th style={{ textAlign: "left" }}>
                  <CustomText color="b500" size="sss" bold="normal">
                    User
                  </CustomText>
                </th>
                <th>
                  <div className="most-share-voice-component-table-header-text">
                    <CustomText color="b500" size="sss" bold="normal" inline>
                      Role
                    </CustomText>
                  </div>
                </th>
                <th>
                  <div className="most-share-voice-component-table-header-text">
                    <CustomText color="b500" size="sss" bold="normal" inline>
                      Action
                    </CustomText>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTab === "global" ? (
                <>
                  {listUserGlobal.map((value, index) => (
                    <tr className="most-share-voice-component-row">
                      <td className="most-share-voice-component-profile-name">
                        <CustomText
                          color="b700"
                          bold="medium"
                          size="2xls"
                          inline
                        >
                          {value.user_email}
                        </CustomText>
                      </td>
                      <td>
                        <CustomText size="2xls" color="b600" bold="medium">
                          {value.role}
                        </CustomText>
                      </td>
                      <td>
                        <div className="most-share-voice-component-mentions">
                          <CustomText
                            color="brand"
                            bold="semibold"
                            size="2xls"
                            inline
                            pointer
                            onClick={() => handleOpenDialogDelete(value)}
                          >
                            Remove Access
                          </CustomText>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : (
                <>
                  {listUserIndividual.map((value, index) => (
                    <tr className="most-share-voice-component-row">
                      <td style={{ textAlign: "left" }}>
                        <CustomText
                          color="b700"
                          bold="medium"
                          size="2xls"
                          inline
                        >
                          {value.project_name}
                        </CustomText>
                      </td>
                      <td style={{ textAlign: "left" }}>
                        <CustomText
                          color="b700"
                          bold="medium"
                          size="2xls"
                          inline
                        >
                          {value.user_email}
                        </CustomText>
                      </td>
                      <td>
                        <CustomText size="2xls" color="b600" bold="medium">
                          {value.role}
                        </CustomText>
                      </td>
                      <td>
                        <div className="most-share-voice-component-mentions">
                          <CustomText
                            color="brand"
                            bold="semibold"
                            size="2xls"
                            onClick={() => handleOpenDialogDelete(value)}
                            pointer
                            inline
                          >
                            Remove Access
                          </CustomText>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog
        open={isDialogDeleteOpen}
        onClose={() => setIsDialogDeleteOpen(false)}
        scroll="body"
        maxWidth="xl"
        setFullWidth={true}
      >
        <div className="account-setting-delete-user-dialog-container">
          <CustomText size="lgs" bold="semibold" inline>
            Remove access
          </CustomText>
          <CustomText size="2xls" color="b600" inline>
            {deleteUser.user_email} access will lose their access?
          </CustomText>
          <div className="account-setting-button-container">
            <Button
              variant="outlined"
              color="neutral"
              sx={{ width: "47%" }}
              onClick={() => setIsDialogDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="danger"
              sx={{ width: "47%" }}
              onClick={() => handleDeleteUser(deleteUser)}
            >
              Remove
            </Button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        scroll="body"
        maxWidth="xl"
        setFullWidth={true}
      >
        <div className="account-setting-add-user-dialog-container">
          <div>
            <CustomText bold="semibold" size="lgs">
              Assign a new user
            </CustomText>
            <CustomText size="2xls" color="b600">
              Give access to new user for global access or selected individual
              project.
            </CustomText>
          </div>
          <div>
            <CustomText bold="medium" size="2xls" color="b700">
              User email address:
            </CustomText>
            <Input placeholder="Enter email" onChange={handleChangeEmail} />
          </div>
          <div>
            <CustomText bold="medium" color="b700" size="2xls">
              Access type:
            </CustomText>
            <div className="account-setting-radio-container">
              <div className="account-setting-radio-item-half">
                <Radio
                  checked={selectedAccessType === "global"}
                  onChange={handleChangeAccessType}
                  value="global"
                  name="radio-buttons"
                  slotProps={{ input: { "aria-label": "global" } }}
                />
                <CustomText bold="medium" color="b700" size="2xls">
                  Global access
                </CustomText>
                <CustomText color="b600" size="sss">
                  User with full access to the account are authorized to perform
                  all actions and set permissions for users and projects within
                  the account.
                </CustomText>
              </div>
              <div className="account-setting-radio-item-half">
                <Radio
                  checked={selectedAccessType === "individual"}
                  onChange={handleChangeAccessType}
                  value="individual"
                  name="radio-buttons"
                  slotProps={{ input: { "aria-label": "individual" } }}
                />
                <CustomText bold="medium" color="b700" size="2xls">
                  Individual Project
                </CustomText>
                <CustomText color="b600" size="sss">
                  Access to an individual project allows the user to work only
                  on the selected project.
                </CustomText>
              </div>
            </div>
          </div>
          {selectedAccessType === "individual" && (
            <div>
              <CustomText>Project</CustomText>

              <select
                className="custom-select"
                value={selectedProject}
                onChange={handleSelectProject}
              >
                {listKeywords.map((value) => (
                  <option value={value.id}>{value.name}</option>
                ))}
              </select>
            </div>
          )}
          {selectedAccessType === "global" ? (
            <>
              <div>
                <CustomText bold="medium" color="b700" size="2xls">
                  Set a role:
                </CustomText>
                <div className="account-setting-radio-container">
                  <div className="account-setting-radio-item-third">
                    <Radio
                      checked={selectedRoleGlobal === "standard"}
                      onChange={handleChangeRoleGlobal}
                      value="standard"
                      name="radio-buttons"
                      slotProps={{ input: { "aria-label": "standard" } }}
                    />
                    <CustomText bold="medium" color="b700" size="2xls">
                      Standard
                    </CustomText>
                    <CustomText color="b600" size="sss">
                      Full privileges to administrate projects (add, edit,
                      delete). No access to the account settings.
                    </CustomText>
                  </div>
                  <div className="account-setting-radio-item-third">
                    <Radio
                      checked={selectedRoleGlobal === "observer"}
                      onChange={handleChangeRoleGlobal}
                      value="observer"
                      name="radio-buttons"
                      slotProps={{ input: { "aria-label": "observer" } }}
                    />
                    <CustomText bold="medium" color="b700" size="2xls">
                      Observer
                    </CustomText>
                    <CustomText color="b600" size="sss">
                      Ability to preview all projects.No privileges to add,
                      edit, delete. No access to account settings.
                    </CustomText>
                  </div>
                  <div className="account-setting-radio-item-third">
                    <Radio
                      checked={selectedRoleGlobal === "administrator"}
                      onChange={handleChangeRoleGlobal}
                      value="administrator"
                      name="radio-buttons"
                      slotProps={{ input: { "aria-label": "administrator" } }}
                    />
                    <CustomText bold="medium" color="b700" size="2xls">
                      Administrator
                    </CustomText>
                    <CustomText color="b600" size="sss">
                      Full privileges to all actions. Equal to the account owner
                    </CustomText>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <CustomText bold="medium" color="b700" size="2xls">
                  Set a role:
                </CustomText>
                <div className="account-setting-radio-container">
                  <div className="account-setting-radio-item-half">
                    <Radio
                      checked={selectedRoleIndividual === "full_access"}
                      onChange={handleChangeRoleIndividual}
                      value="full_access"
                      name="radio-buttons"
                      slotProps={{ input: { "aria-label": "full_access" } }}
                    />
                    <CustomText bold="medium" color="b700" size="2xls">
                      Full Access
                    </CustomText>
                    <CustomText color="b600" size="sss">
                      Full privileges to administrate certain project (add,
                      edit, delete).
                    </CustomText>
                  </div>
                  <div className="account-setting-radio-item-half">
                    <Radio
                      checked={selectedRoleIndividual === "preview_only"}
                      onChange={handleChangeRoleIndividual}
                      value="preview_only"
                      name="radio-buttons"
                      slotProps={{ input: { "aria-label": "preview_only" } }}
                    />
                    <CustomText bold="medium" color="b700" size="2xls">
                      Preview only
                    </CustomText>
                    <CustomText color="b600" size="sss">
                      Ability to preview certain project. No privileges to edit
                      project and delete entries.
                    </CustomText>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="account-setting-button-container">
            <Button
              variant="outlined"
              color="neutral"
              sx={{ width: "47%" }}
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              sx={{ width: "47%" }}
              disabled={isButtonDisabled()}
              onClick={() => handleCreateNewUser()}
            >
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

const MenuHeader = ({ changePage }) => {
  return (
    <>
      <div className="account-setting-menu-header-container">
        <div
          onClick={() => changePage("main")}
          className="account-setting-menu-header-item"
        >
          <ChevronLeft
            sx={{ width: "20px", height: "20px", color: "#0047AB" }}
          />
          <CustomText bold="semibold" size="xls" color="brand" inline>
            Back to account settings
          </CustomText>
        </div>
      </div>
    </>
  );
};
