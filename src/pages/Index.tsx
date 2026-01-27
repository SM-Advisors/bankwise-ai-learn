import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraining } from '@/contexts/TrainingContext';
import Welcome from './Welcome';

const Index = () => {
  const navigate = useNavigate();
  const { state } = useTraining();

  useEffect(() => {
    // If questionnaire is already completed, redirect to topic selection
    if (state.questionnaireCompleted && state.learningStyle) {
      navigate('/topics');
    }
  }, [state.questionnaireCompleted, state.learningStyle, navigate]);

  return <Welcome />;
};

export default Index;