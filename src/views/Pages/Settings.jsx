import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjects, updateProjectKeywords, deleteProjectById } from "../../services/projectService";
import CustomButton from "../../components/CustomButton";
import CustomText from "../../components/CustomText";
import { Close, WarningAmber as WarningAmberIcon } from '@mui/icons-material'; // For remove keyword button, Added WarningAmberIcon
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import "./styles/Settings.css";

const Settings = () => {
  const { keyword: projectUrlParam } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [keywordsForEdit, setKeywordsForEdit] = useState([]);
  const [newKeywordInput, setNewKeywordInput] = useState("");
  const [authUserId, setAuthUserId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const authData = JSON.parse(localStorage.getItem("user"));
      const currentUserId = authData?.value?.id ? Number(authData.value.id) : null;
      setAuthUserId(currentUserId);

      const data = await getProjects();
      const allProjects = [...(data.owned_projects || []), ...(data.accessible_projects || [])];
      const decodedProjectName = decodeURIComponent(projectUrlParam);
      const currentProject = allProjects.find(p => p.name === decodedProjectName);

      if (currentProject) {
        setProject(currentProject);
        const projectOwnerId = currentProject.owner_id ? Number(currentProject.owner_id) : null;
        const owned = currentUserId !== null && projectOwnerId !== null && projectOwnerId === currentUserId;
        setIsOwned(owned);
        setKeywordsForEdit(currentProject.keywords ? [...currentProject.keywords] : []);
      } else {
        setError("Project not found or you do not have access.");
      }
    } catch (err) {
      setError("Failed to load project data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectUrlParam) {
      fetchProjectData();
    }
  }, [projectUrlParam]);

  const handleStartEditKeywords = () => {
    setIsEditingKeywords(true);
    // KeywordsForEdit is already initialized/updated in fetchProjectData
  };

  const handleAddKeyword = () => {
    if (newKeywordInput.trim() && !keywordsForEdit.includes(newKeywordInput.trim())) {
      setKeywordsForEdit([...keywordsForEdit, newKeywordInput.trim()]);
      setNewKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setKeywordsForEdit(keywordsForEdit.filter(kw => kw !== keywordToRemove));
  };

  const handleSaveKeywords = async () => {
    if (!project) return;
    try {
      setLoading(true);
      await updateProjectKeywords(project.id, keywordsForEdit);
      setIsEditingKeywords(false);
      fetchProjectData(); // Refresh project data
    } catch (err) {
      setError("Failed to update keywords.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingKeywords(false);
    // Re-fetch or reset keywordsForEdit to original project keywords
    setKeywordsForEdit(project?.keywords ? [...project.keywords] : []);
    setNewKeywordInput("");
  };

  const handleOpenDeleteDialog = () => {
    if (!project) return;
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const executeDeleteProject = async () => {
    if (!project) return;
    handleCloseDeleteDialog(); // Close dialog first
    try {
      setLoading(true);
      await deleteProjectById(project.id);
      // Consider replacing alert with a Snackbar or other notification component for better UX
      alert("Project deleted successfully. You will be redirected.");
      window.location.href = '/'; // Redirect after successful deletion
    } catch (err) {
      setError("Failed to delete project.");
      console.error(err);
      // Potentially show error in a Snackbar/Toast as well
    } finally {
      setLoading(false); // Ensure loading is false even if redirection happens
    }
  };

  if (loading && !openDeleteDialog) { // Don't show main page loading if dialog is open and an action is in progress
    return <div className="settings-page"><div className="loading-spinner"></div><CustomText>Loading project settings...</CustomText></div>;
  }

  if (error) {
    return <div className="settings-page error-message"><CustomText type="error">{error}</CustomText></div>;
  }

  if (!project) {
    // This case should ideally be covered by the error state if project isn't found
    return <div className="settings-page"><CustomText>Project not found.</CustomText></div>;
  }

  const canEdit = isOwned || (project.role === "full_access");
  const canDelete = isOwned;

  return (
    <div className="settings-page">
      <CustomText type="header" className="page-header">Project Settings: {project.name}</CustomText>
      
      <div className="settings-content-wrapper">
        {/* Project Information Section */}
        <div className="settings-section project-info-section">
          <CustomText type="subheader" className="section-title">Project Information</CustomText>
          <div className="info-grid">
            <div className="info-item"><CustomText type="label">ID:</CustomText><CustomText>{project.id}</CustomText></div>
            <div className="info-item"><CustomText type="label">Name:</CustomText><CustomText>{project.name}</CustomText></div>
            <div className="info-item"><CustomText type="label">Status:</CustomText><CustomText>{isOwned ? "Owned" : "Accessible"}</CustomText></div>
            {project.role && <div className="info-item"><CustomText type="label">Role:</CustomText><CustomText>{project.role}</CustomText></div>}
            <div className="info-item"><CustomText type="label">Created At:</CustomText><CustomText>{new Date(project.created_at).toLocaleDateString()}</CustomText></div>
            <div className="info-item"><CustomText type="label">Updated At:</CustomText><CustomText>{new Date(project.updated_at).toLocaleDateString()}</CustomText></div>
          </div>
        </div>

        {/* Manage Keywords Section */}
        {canEdit && (
          <div className="settings-section manage-keywords-section">
            <CustomText type="subheader" className="section-title">Manage Keywords</CustomText>
            {!isEditingKeywords ? (
              <>
                <div className="keywords-display-area">
                  {project.keywords && project.keywords.length > 0 ? (
                    project.keywords.map((kw, index) => <span key={index} className="keyword-tag-display">{kw}</span>)
                  ) : (
                    <CustomText><em>No keywords yet.</em></CustomText>
                  )}
                </div>
                <CustomButton onClick={handleStartEditKeywords} disabled={loading} className="edit-keywords-btn">
                  Edit Keywords
                </CustomButton>
              </>
            ) : (
              <div className="keywords-edit-area">
                <div className="current-keywords-editor">
                  {keywordsForEdit.map((kw, index) => (
                    <span key={index} className="keyword-tag-editable">
                      {kw}
                      <button onClick={() => handleRemoveKeyword(kw)} className="remove-keyword-btn" disabled={loading}>
                        <Close fontSize="small" />
                      </button>
                    </span>
                  ))}
                  {keywordsForEdit.length === 0 && <CustomText><em>No keywords. Start adding some!</em></CustomText>}
                </div>
                <div className="add-keyword-input-group">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    placeholder="Add a new keyword"
                    className="add-keyword-input"
                    disabled={loading}
                    onKeyPress={(e) => { if (e.key === 'Enter') { handleAddKeyword(); e.preventDefault();}}}
                  />
                  <CustomButton onClick={handleAddKeyword} disabled={loading || !newKeywordInput.trim()} className="add-keyword-btn">
                    Add
                  </CustomButton>
                </div>
                <div className="edit-actions">
                  <CustomButton onClick={handleSaveKeywords} disabled={loading} className="save-keywords-btn">
                    {loading ? "Saving..." : "Save Changes"}
                  </CustomButton>
                  <CustomButton onClick={handleCancelEdit} variant="secondary" disabled={loading} className="cancel-edit-btn">
                    Cancel
                  </CustomButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone Section */}
        {canDelete && (
          <div className="settings-section danger-zone-section">
            <CustomText type="subheader" className="section-title danger-title">Danger Zone</CustomText>
            <div className="danger-content">
              <CustomText>Deleting your project is permanent and cannot be undone.</CustomText>
              <CustomButton
                onClick={handleOpenDeleteDialog} // Changed to open the dialog
                variant="danger" // Make sure CustomButton supports this or style it
                disabled={loading}
                className="delete-project-btn"
              >
                {loading && !openDeleteDialog ? "Deleting..." : "Delete This Project"}
              </CustomButton>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {project && (
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
              borderRadius: '8px',
              padding: '10px'
            }
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', color: 'rgb(211, 47, 47)' /* MUI error.main red */ }}>
            <WarningAmberIcon sx={{ marginRight: '8px' }} />
            Confirm Project Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{color: '#424242'}}>
              Are you sure you want to delete the project "<strong>{project.name}</strong>"? 
              <br />
              This action is permanent and cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ paddingRight: '24px', paddingBottom: '16px' }}>
            <Button 
              onClick={handleCloseDeleteDialog} 
              variant="outlined" 
              color="primary" 
              disabled={loading}
              sx={{ marginRight: '8px', textTransform: 'none', borderRadius: '6px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={executeDeleteProject} 
              variant="contained" 
              color="error" 
              autoFocus 
              disabled={loading}
              sx={{ textTransform: 'none', borderRadius: '6px' }}
            >
              {loading ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Settings;
