import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import './SubmitPromptPage.css';

const SubmitPromptPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    routerName: '',
    description: '',
    paperUrl: '',
    githubUrl: '',
    modelPool: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        institution: '',
        routerName: '',
        description: '',
        paperUrl: '',
        githubUrl: '',
        modelPool: '',
        additionalInfo: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <Send className="title-icon" />
            Submit Your Router
          </h1>
          <p className="page-subtitle">
            Submit your LLM router for evaluation and inclusion in the RouterArena leaderboard
          </p>
        </div>

        <div className="submit-content">
          <div className="submit-info">
            <h2>Submission Guidelines</h2>
            <div className="guidelines">
              <div className="guideline-item">
                <CheckCircle className="guideline-icon" />
                <div>
                  <h3>Academic Routers</h3>
                  <p>Provide GitHub repository with training code and model weights</p>
                </div>
              </div>
              <div className="guideline-item">
                <CheckCircle className="guideline-icon" />
                <div>
                  <h3>Commercial Routers</h3>
                  <p>Provide API access or detailed technical specifications</p>
                </div>
              </div>
              <div className="guideline-item">
                <CheckCircle className="guideline-icon" />
                <div>
                  <h3>Documentation</h3>
                  <p>Include paper or technical documentation describing your approach</p>
                </div>
              </div>
              <div className="guideline-item">
                <CheckCircle className="guideline-icon" />
                <div>
                  <h3>Model Pool</h3>
                  <p>Specify the models your router can select from</p>
                </div>
              </div>
            </div>

            <div className="evaluation-process">
              <h3>Evaluation Process</h3>
              <div className="process-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Submission Review</h4>
                    <p>We review your submission and verify all required information</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Integration</h4>
                    <p>We integrate your router into our evaluation framework</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Evaluation</h4>
                    <p>Your router is evaluated on our comprehensive dataset</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Leaderboard Update</h4>
                    <p>Results are added to the public leaderboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="submit-form-container">
            <form onSubmit={handleSubmit} className="submit-form">
              <h2>Router Submission Form</h2>
              
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="institution">Institution/Organization *</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="routerName">Router Name *</label>
                <input
                  type="text"
                  id="routerName"
                  name="routerName"
                  value={formData.routerName}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Router Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe your router's approach, methodology, and key features..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="paperUrl">Paper URL</label>
                <input
                  type="url"
                  id="paperUrl"
                  name="paperUrl"
                  value={formData.paperUrl}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://arxiv.org/abs/..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="githubUrl">GitHub Repository</label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modelPool">Model Pool *</label>
                <textarea
                  id="modelPool"
                  name="modelPool"
                  value={formData.modelPool}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="List the models your router can select from (e.g., GPT-4, Claude-3, Llama-2-70B, ...)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="additionalInfo">Additional Information</label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="Any additional information about your router, special requirements, or notes..."
                />
              </div>

              {submitStatus === 'success' && (
                <div className="status-message success">
                  <CheckCircle className="status-icon" />
                  <span>Submission successful! We'll review your router and get back to you soon.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="status-message error">
                  <AlertCircle className="status-icon" />
                  <span>Submission failed. Please try again or contact us directly.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="button-icon" />
                    Submit Router
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPromptPage;
