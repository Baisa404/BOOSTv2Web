import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Container, Alert } from "react-bootstrap";
import {
  signInWithPopup,
  deleteUser,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, facebookProvider, googleProvider } from "../firebase";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { User } from "firebase/auth";

const LoginSecurity = () => {
  const [showInput, setShowInput] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [canUpdatePassword, setCanUpdatePassword] = useState<boolean>(false);
  const db = getFirestore();

  // Fetch user data on initial render
  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
    }
  }, []);

  useEffect(() => {
    // Enable "Confirm" button only when both passwords are entered
    setCanUpdatePassword(!!oldPassword && !!newPassword);
  }, [oldPassword, newPassword]);

  // Handle social login (Facebook & Google)
  const handleFacebookLogin = () => {
    signInWithPopup(auth, facebookProvider)
      .then((result) => setUser(result.user))
      .catch((err) => console.log(err));
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => setUser(result.user))
      .catch((err) => console.log(err));
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return alert("No user is logged in.");
    if (!window.confirm("Delete your account? This is irreversible.")) return;

    try {
      await deleteUser(auth.currentUser);
      alert("Account deleted.");
      setUser(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting account.");
    }
  };

  // Handle data download
  const handleDownloadData = async () => {
    if (!auth.currentUser) return alert("No user is logged in.");
    if (!window.confirm("Download your data?")) return;

    try {
      const userDoc = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userDoc);
      if (!snap.exists()) return alert("No data found.");

      const blob = new Blob([JSON.stringify(snap.data(), null, 2)], {
        type: "application/json",
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${auth.currentUser.displayName}_data.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error(err);
      alert("Error downloading data.");
    }
  };

  // Handle email update
  const handleEmailUpdate = async () => {
    if (!user) return;

    try {
      // Update the email in Firebase Authentication
      await updateEmail(user, newEmail);

      // Update the email in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { email: newEmail });

      alert("Email updated successfully.");
      setUser(auth.currentUser); // Refresh user data
    } catch (err) {
      console.error(err);
      alert("Error updating email.");
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!user) return;

    if (!oldPassword || !newPassword) {
      return alert("Both old and new password are required.");
    }

    try {
      // Reauthenticate the user with the old password
      const credential = EmailAuthProvider.credential(user.email!, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password in Firebase Authentication
      await updatePassword(user, newPassword);

      alert("Password updated successfully.");
      setOldPassword(""); // Clear the old password field
      setNewPassword(""); // Clear the new password field
    } catch (err) {
      console.error(err);
      alert("Error updating password. Please check your old password.");
    }
  };

  return (
    <Container className="pt-4" style={{ maxWidth: "1000px" }}>
      <Row className="align-items-center mb-3">
        <Col sm="auto">
          <strong>Email</strong>
        </Col>
        <Col sm="auto">
          {showInput ? (
            <Form.Control
              size="sm"
              type="email"
              placeholder="Enter new email..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          ) : (
            <span>{user?.email}</span>
          )}
        </Col>
        <Col sm="auto">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowInput(!showInput)}
          >
            {showInput ? "Cancel" : "Edit"}
          </Button>
        </Col>
        {showInput && (
          <Col sm="auto">
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleEmailUpdate}
            >
              Confirm
            </Button>
          </Col>
        )}
      </Row>

      <Row className="mb-4">
        <Col sm="auto">
          <strong>Old Password</strong>
        </Col>
        <Col sm="auto">
          <Form.Control
            size="sm"
            type="password"
            placeholder="Enter old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col sm="auto">
          <strong>New Password</strong>
        </Col>
        <Col sm="auto">
          <Form.Control
            size="sm"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Col>
      </Row>

      {canUpdatePassword && (
        <Button
          variant="outline-success"
          size="sm"
          onClick={handlePasswordUpdate}
        >
          Update Password
        </Button>
      )}

      <h5 className="mb-3">Social Media Login</h5>
      <Row className="mb-3">
        <Col xs={12} className="mb-2">
          <Button
            variant="light"
            className="w-100 text-start"
            onClick={handleFacebookLogin}
          >
            <img
              src="https://img.icons8.com/color/24/facebook-new.png"
              alt="fb"
            />{" "}
            Facebook
          </Button>
        </Col>

        <Col xs={12}>
          <Button
            variant="light"
            className="w-100 text-start"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://img.icons8.com/color/24/gmail-new.png"
              alt="gmail"
            />{" "}
            Gmail
          </Button>
        </Col>
      </Row>

      <Row className="mt-4 g-3">
        <Col xs={12} md={6}>
          <Button
            variant="success"
            className="w-100"
            onClick={handleDownloadData}
          >
            Download Data
          </Button>
        </Col>
        <Col xs={12} md={6}>
          <Button
            variant="danger"
            className="w-100"
            onClick={handleDeleteAccount}
          >
            Account Deletion
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginSecurity;
