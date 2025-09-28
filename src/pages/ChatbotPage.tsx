import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Brain, Heart, Target,
  Moon, Shield, Users, TrendingDown, Clock, Star, CheckCircle,
  ArrowRight, Play, RotateCcw, Eye, AlertTriangle, Sparkles, Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'binary' | 'multiple' | 'text';
  options?: string[];
  required: boolean;
}

interface Assessment {
  issue: string;
  questions: Question[];
  responses: Record<string, any>;
}

interface TherapyRecommendation {
  moduleId: string;
  title: string;
  description: string;
  priority: number;
  icon: any;
  color: string;
  estimatedDuration: string;
  benefits: string[];
}

interface TherapyPlan {
  id: string;
  issue: string;
  severity: 'mild' | 'moderate' | 'severe';
  planDuration: number;
  recommendations: TherapyRecommendation[];
  startDate: string;
  description: string;
}

const ChatbotPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<TherapyPlan | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  const mentalHealthIssues = [
    { id: 'anxiety-disorders', name: 'Anxiety Disorders', icon: Brain, color: 'from-blue-500 to-cyan-500', description: 'Persistent worry, fear, and anxiety symptoms' },
    { id: 'depression', name: 'Depression & Low Mood', icon: Heart, color: 'from-purple-500 to-pink-500', description: 'Sadness, hopelessness, and depressive symptoms' },
    { id: 'stress', name: 'Stress & Burnout', icon: Target, color: 'from-orange-500 to-red-500', description: 'Overwhelm, exhaustion, and chronic stress' },
    { id: 'insomnia', name: 'Insomnia & Sleep Problems', icon: Moon, color: 'from-indigo-500 to-purple-500', description: 'Sleep difficulties and sleep disorders' },
    { id: 'trauma', name: 'Trauma & PTSD', icon: Shield, color: 'from-red-500 to-pink-500', description: 'Trauma responses and post-traumatic stress' },
    { id: 'self-esteem', name: 'Low Self-Esteem & Self-Doubt', icon: Star, color: 'from-yellow-500 to-orange-500', description: 'Poor self-image and confidence issues' },
    { id: 'emotional-dysregulation', name: 'Emotional Dysregulation', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Difficulty managing and controlling emotions' },
    { id: 'negative-thoughts', name: 'Negative Thought Patterns & Overthinking', icon: Brain, color: 'from-gray-500 to-slate-500', description: 'Rumination and persistent negative thinking' },
    { id: 'social-anxiety', name: 'Social Anxiety', icon: Users, color: 'from-teal-500 to-cyan-500', description: 'Fear and anxiety in social situations' },
    { id: 'adjustment', name: 'Adjustment & Identity Issues', icon: Compass, color: 'from-green-500 to-teal-500', description: 'Life transitions and identity concerns' }
  ];

  const questionnaires = {
    'anxiety-disorders': [
      // Open-ended questions (2)
      { id: '1', text: 'Can you tell me about a recent time when you felt anxious?', type: 'open', required: true },
      { id: '2', text: 'How does anxiety show up in your daily life?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you experience physical symptoms when anxious (like rapid heartbeat, sweating, or trembling)?', type: 'closed', required: true },
      { id: '4', text: 'Have you ever had a panic attack?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how intense is your anxiety when it happens?', type: 'scaling', required: true },
      { id: '6', text: 'How much does anxiety interfere with your daily activities? (1 = not at all, 10 = completely)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you usually do when you start feeling anxious?', type: 'behavioral', required: true },
      { id: '8', text: 'Are there situations you avoid because of anxiety?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you think triggers your anxiety the most?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would your life look like if anxiety didn\'t hold you back?', type: 'future', required: true }
    ],
    depression: [
      // Open-ended questions (2)
      { id: '1', text: 'Can you describe how you\'ve been feeling lately?', type: 'open', required: true },
      { id: '2', text: 'Tell me about your energy levels and motivation recently.', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Have you lost interest in activities you used to enjoy?', type: 'closed', required: true },
      { id: '4', text: 'Are you experiencing changes in your sleep or appetite?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how would you rate your mood most days?', type: 'scaling', required: true },
      { id: '6', text: 'How difficult is it for you to concentrate or make decisions? (1 = very easy, 10 = extremely difficult)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you do when you\'re feeling really low?', type: 'behavioral', required: true },
      { id: '8', text: 'How do you typically spend your days when you\'re feeling down?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you think might be contributing to how you\'re feeling?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would feeling better look like for you?', type: 'future', required: true }
    ],
    stress: [
      // Open-ended questions (2)
      { id: '1', text: 'What are the main sources of stress in your life right now?', type: 'open', required: true },
      { id: '2', text: 'Can you describe how stress feels in your body?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you feel overwhelmed by your daily responsibilities?', type: 'closed', required: true },
      { id: '4', text: 'Do you have time for relaxation in your typical day?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how stressed do you feel on a typical day?', type: 'scaling', required: true },
      { id: '6', text: 'How well do you feel you manage stress currently? (1 = very poorly, 10 = very well)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you usually do when you feel stressed?', type: 'behavioral', required: true },
      { id: '8', text: 'How does stress affect the way you interact with others?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What patterns do you notice in your stress levels?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would help you feel more in control of your stress?', type: 'future', required: true }
    ],
    insomnia: [
      // Open-ended questions (2)
      { id: '1', text: 'Can you walk me through what a typical night looks like for you?', type: 'open', required: true },
      { id: '2', text: 'How do you feel when you wake up in the morning?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you wake up frequently during the night?', type: 'closed', required: true },
      { id: '4', text: 'Do you have a regular bedtime routine?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'How many hours of sleep do you typically get per night?', type: 'scaling', required: true },
      { id: '6', text: 'On a scale of 1-10, how rested do you feel when you wake up?', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you do when you can\'t fall asleep?', type: 'behavioral', required: true },
      { id: '8', text: 'How does poor sleep affect your next day?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you think might be contributing to your sleep difficulties?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would good sleep mean for your overall well-being?', type: 'future', required: true }
    ],
    trauma: [
      // Open-ended questions (2)
      { id: '1', text: 'Can you share what you feel comfortable telling me about your experience?', type: 'open', required: true },
      { id: '2', text: 'How has this experience affected your daily life?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you experience flashbacks or intrusive memories?', type: 'closed', required: true },
      { id: '4', text: 'Are there places or situations you now avoid?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how safe do you feel in your daily life?', type: 'scaling', required: true },
      { id: '6', text: 'How much do these experiences interfere with your relationships? (1 = not at all, 10 = completely)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you do when you\'re feeling triggered or overwhelmed?', type: 'behavioral', required: true },
      { id: '8', text: 'How do you cope with difficult memories when they come up?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you notice about your body and emotions when you\'re reminded of the experience?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would feeling safe and in control look like for you?', type: 'future', required: true }
    ],
    'self-esteem': [
      // Open-ended questions (2)
      { id: '1', text: 'How do you typically talk to yourself in your mind?', type: 'open', required: true },
      { id: '2', text: 'Tell me about a time when you felt really good about yourself.', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you often compare yourself to others?', type: 'closed', required: true },
      { id: '4', text: 'Do you find it hard to accept compliments?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how confident do you feel in social situations?', type: 'scaling', required: true },
      { id: '6', text: 'How much do you doubt your abilities or decisions? (1 = never, 10 = constantly)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'How do you react when someone gives you feedback or criticism?', type: 'behavioral', required: true },
      { id: '8', text: 'What do you do when you make a mistake?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you think shaped how you see yourself?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'How would you like to feel about yourself?', type: 'future', required: true }
    ],
    'emotional-dysregulation': [
      // Open-ended questions (2)
      { id: '1', text: 'Can you describe what it feels like when your emotions feel overwhelming?', type: 'open', required: true },
      { id: '2', text: 'Tell me about how your emotions change throughout a typical day.', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you have difficulty calming down when you\'re upset?', type: 'closed', required: true },
      { id: '4', text: 'Do your emotions sometimes feel too big for the situation?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how intense are your emotions when they hit?', type: 'scaling', required: true },
      { id: '6', text: 'How much control do you feel over your emotional reactions? (1 = no control, 10 = complete control)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you do when you feel emotionally overwhelmed?', type: 'behavioral', required: true },
      { id: '8', text: 'How do your emotional reactions affect your relationships?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you notice triggers your most intense emotional responses?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would emotional balance feel like for you?', type: 'future', required: true }
    ],
    ],
    'negative-thoughts': [
      // Open-ended questions (2)
      { id: '1', text: 'What kinds of thoughts tend to get stuck in your mind?', type: 'open', required: true },
      { id: '2', text: 'Can you describe what it\'s like when you\'re overthinking?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you replay conversations or events in your mind repeatedly?', type: 'closed', required: true },
      { id: '4', text: 'Do you often imagine worst-case scenarios?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'How much time would you say you spend overthinking each day? (1 = very little, 10 = most of the day)', type: 'scaling', required: true },
      { id: '6', text: 'How much do negative thoughts interfere with your daily activities? (1 = not at all, 10 = completely)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you do when you notice you\'re stuck in negative thinking?', type: 'behavioral', required: true },
      { id: '8', text: 'How do these thought patterns affect your mood and behavior?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What do you notice about when these negative thoughts are strongest?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would it be like to have more balanced, peaceful thoughts?', type: 'future', required: true }
    ],
    'social-anxiety': [
      // Open-ended questions (2)
      { id: '1', text: 'Can you tell me about a social situation that felt particularly difficult for you?', type: 'open', required: true },
      { id: '2', text: 'How do you feel before, during, and after social interactions?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you worry about being judged or embarrassed in social settings?', type: 'closed', required: true },
      { id: '4', text: 'Do you avoid certain social situations because of anxiety?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how anxious do you feel in group settings?', type: 'scaling', required: true },
      { id: '6', text: 'How much does social anxiety affect your work or school? (1 = not at all, 10 = severely)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you do to prepare for social situations?', type: 'behavioral', required: true },
      { id: '8', text: 'How do you handle it when you feel anxious around others?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What thoughts go through your mind in social situations?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would feeling comfortable in social situations mean for your life?', type: 'future', required: true }
    ],
    adjustment: [
      // Open-ended questions (2)
      { id: '1', text: 'What major changes or transitions are happening in your life right now?', type: 'open', required: true },
      { id: '2', text: 'How are you feeling about these changes?', type: 'open', required: true },
      
      // Closed questions (2)
      { id: '3', text: 'Do you feel uncertain about your identity or life direction?', type: 'closed', required: true },
      { id: '4', text: 'Have these changes affected your relationships?', type: 'closed', required: true },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how well are you coping with these changes?', type: 'scaling', required: true },
      { id: '6', text: 'How grounded and secure do you feel in who you are? (1 = very lost, 10 = very secure)', type: 'scaling', required: true },
      
      // Behavioral questions (2)
      { id: '7', text: 'How do you handle uncertainty about the future?', type: 'behavioral', required: true },
      { id: '8', text: 'What do you do when you feel lost or confused about your identity?', type: 'behavioral', required: true },
      
      // Reflective question (1)
      { id: '9', text: 'What aspects of yourself feel most stable right now?', type: 'reflective', required: true },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would feeling more grounded and secure in yourself look like?', type: 'future', required: true }
    ]
  };

  const [currentTextResponse, setCurrentTextResponse] = useState('');

  const therapyModules = {
    'cbt': { title: 'CBT Thought Records', icon: Brain, color: 'from-purple-500 to-pink-500' },
    'mindfulness': { title: 'Mindfulness & Breathing', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    'stress': { title: 'Stress Management', icon: Target, color: 'from-orange-500 to-red-500' },
    'gratitude': { title: 'Gratitude Journal', icon: Heart, color: 'from-green-500 to-teal-500' },
    'music': { title: 'Relaxation Music', icon: Heart, color: 'from-purple-500 to-blue-500' },
    'tetris': { title: 'Tetris Therapy', icon: Target, color: 'from-cyan-500 to-blue-500' },
    'art': { title: 'Art & Color Therapy', icon: Heart, color: 'from-pink-500 to-purple-500' },
    'exposure': { title: 'Exposure Therapy', icon: Eye, color: 'from-yellow-500 to-orange-500' },
    'video': { title: 'Video Therapy', icon: Play, color: 'from-blue-500 to-indigo-500' },
    'act': { title: 'Acceptance & Commitment Therapy', icon: Star, color: 'from-teal-500 to-cyan-500' }
  };

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      id: '1',
      type: 'bot',
      content: `Hello ${user?.name}! I'm your AI mental health assistant. I'm here to provide personalized support and create a therapy plan tailored just for you.\n\nWould you like me to help you identify the best therapy approach for your current needs?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [user]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (content: string, type: 'bot' | 'user' = 'bot') => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    addMessage(content, type);
  };

  const startAssessment = (issueId: string) => {
    const issue = mentalHealthIssues.find(i => i.id === issueId);
    const questions = questionnaires[issueId as keyof typeof questionnaires] || [];
    
    // Clear previous assessment state
    setCurrentAssessment(null);
    setCurrentQuestionIndex(0);
    setGeneratedPlan(null);
    setShowPlanSelection(false);

    // Add initial bot messages to chat history
    addMessage(`I'd like to start an assessment for ${issue?.name}. This will help me understand your specific situation better.`, 'user');
    simulateTyping(`Great! I'll ask you some questions about ${issue?.name.toLowerCase()} to create the best therapy plan for you. Let's begin:`);

    setCurrentAssessment({
      issue: issue?.name || 'Unknown Issue',
      questions,
      responses: {}
    });
  };

  const handleQuestionResponse = (response: any) => {
    if (!currentAssessment) return;

    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    
    // Add the question and response to chat history
    addMessage(currentQuestion.text, 'bot');
    addMessage(response, 'user');

    const updatedAssessment = {
      ...currentAssessment,
      responses: { ...currentAssessment.responses, [currentQuestion.id]: response }
    };
    setCurrentAssessment(updatedAssessment);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentAssessment.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentTextResponse(updatedAssessment.responses[currentAssessment.questions[nextIndex].id] || '');
    } else {
      // Assessment complete, generate plan
      setCurrentAssessment(null); // Clear assessment from main view
      setCurrentQuestionIndex(0);
      generateTherapyPlan(updatedAssessment);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentTextResponse(currentAssessment?.responses[currentAssessment.questions[prevIndex].id] || '');
      // No need to add message to history, it's already there.
    }
  };

  const generateTherapyPlan = (assessment: Assessment) => {
    // Analyze responses to determine severity and recommendations
    const responses = assessment.responses;
    const ratingQuestions = assessment.questions.filter(q => q.type === 'rating');
    const avgRating = ratingQuestions.reduce((sum, q) => sum + (responses[q.id] || 5), 0) / ratingQuestions.length;
    
    let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
    let planDuration = 15;
    
    if (avgRating <= 3) {
      severity = 'mild';
      planDuration = 7;
    } else if (avgRating >= 7) {
      severity = 'severe';
      planDuration = 30;
    }

    // Generate recommendations based on issue type
    const recommendations = getRecommendationsForIssue(assessment.issue.toLowerCase(), severity);

    const plan: TherapyPlan = {
      id: Date.now().toString(),
      issue: assessment.issue,
      severity,
      planDuration,
      recommendations,
      startDate: new Date().toISOString(),
      description: `A ${planDuration}-day personalized therapy plan for ${assessment.issue.toLowerCase()}`
    };

    setGeneratedPlan(plan); // Set plan for modal
    setShowPlanSelection(true);
    simulateTyping(`Based on your responses, I've created a personalized ${planDuration}-day therapy plan for ${assessment.issue.toLowerCase()}. This plan includes ${recommendations.length} evidence-based therapies tailored to your specific needs.`);
  };

  const getRecommendationsForIssue = (issue: string, severity: string): TherapyRecommendation[] => {
    const baseRecommendations: Record<string, string[]> = {
      'anxiety disorders': ['cbt', 'mindfulness', 'exposure', 'music'],
      depression: ['cbt', 'gratitude', 'video', 'act'],
      'stress & burnout': ['stress', 'mindfulness', 'music', 'art'],
      'insomnia & sleep problems': ['mindfulness', 'music', 'video', 'stress'],
      'trauma & ptsd': ['video', 'mindfulness', 'art', 'act'],
      'low self-esteem & self-doubt': ['gratitude', 'cbt', 'video', 'act'],
      'emotional dysregulation': ['mindfulness', 'cbt', 'art', 'video'],
      'negative thought patterns & overthinking': ['cbt', 'mindfulness', 'video', 'gratitude'],
      'social anxiety': ['exposure', 'cbt', 'video', 'mindfulness'],
      'adjustment & identity issues': ['video', 'act', 'gratitude', 'art']
    };

    const moduleIds = baseRecommendations[issue] || ['cbt', 'mindfulness', 'video'];
    
    return moduleIds.map((moduleId, index) => {
      const module = therapyModules[moduleId as keyof typeof therapyModules];
      return {
        moduleId,
        title: module.title,
        description: `Evidence-based ${module.title.toLowerCase()} for ${issue}`,
        priority: index + 1,
        icon: module.icon,
        color: module.color,
        estimatedDuration: '15-30 min',
        benefits: [`Reduces ${issue}`, 'Improves coping skills', 'Builds resilience']
      };
    });
  };

  const acceptPlan = () => {
    if (!generatedPlan) return;

    // Save plan to user progress
    const userProgress = {
      userId: user?.id,
      currentPlan: generatedPlan,
      startDate: new Date().toISOString(),
      completedTherapies: [],
      dailyProgress: {}
    };

    localStorage.setItem('mindcare_user_progress', JSON.stringify(userProgress));
    
    toast.success('Therapy plan accepted! You can now start your personalized journey.');
    setShowPlanSelection(false);
    
    // Navigate to therapies page
    navigate('/therapy-modules');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage(inputMessage, 'user');
    setInputMessage('');
    
    // Simple response logic
    if (inputMessage.toLowerCase().includes('help') || inputMessage.toLowerCase().includes('start')) {
      simulateTyping('I can help you with various mental health concerns. Would you like to start an assessment to get personalized therapy recommendations?');
    } else if (!currentAssessment && !showPlanSelection) { // Only respond if not in assessment or plan selection
      simulateTyping('I understand. Feel free to ask me anything about mental health or start an assessment when you\'re ready.');
    }
  };

  const handleSubmitTextResponse = () => {
    if (!currentTextResponse.trim()) {
      toast.error('Please provide an answer before continuing');
      return;
    }
    handleQuestionResponse(currentTextResponse);
    setCurrentTextResponse('');
  };

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-b ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                AI Mental Health Assistant
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your personalized companion for mental wellness support and therapy planning
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-sm lg:max-w-lg px-5 py-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-white text-gray-800 shadow-lg'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <Bot className="w-4 h-4 mt-1 text-purple-500" />
                  )}
                  <div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`px-5 py-4 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-lg'
              }`}>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Issue Selection */}
          {!currentAssessment && !showPlanSelection && (
            <div className="flex justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-7xl p-8 rounded-2xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 text-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  What would you like help with today?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {mentalHealthIssues.map((issue) => (
                    <motion.button
                      key={issue.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startAssessment(issue.id)}
                      className={`p-6 rounded-xl transition-all duration-200 ${
                        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${issue.color} flex items-center justify-center mx-auto mb-4`}>
                        <issue.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className={`font-semibold text-base ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {issue.name}
                      </h4>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Assessment Questions */}
          {currentAssessment && currentQuestion && (
            <div className="px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-lg p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {currentAssessment.issue}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-4 leading-relaxed ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {currentQuestion.text}
                </h3>

                {/* Question Type Specific Input */}
                <div className="space-y-4">
                  {currentQuestion.type === 'closed' ? (
                    <div className="space-y-3">
                      <div className="flex space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentTextResponse('Yes')}
                          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                            currentTextResponse === 'Yes'
                              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Yes
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentTextResponse('No')}
                          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                            currentTextResponse === 'No'
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                              : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          No
                        </motion.button>
                      </div>
                      {currentTextResponse && (
                        <textarea
                          placeholder="Would you like to add any details?"
                          value={currentTextResponse.includes('Yes') || currentTextResponse.includes('No') ? 
                            currentTextResponse.split(' - ')[1] || '' : currentTextResponse}
                          rows={2}
                          className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          onChange={(e) => {
                            const baseAnswer = currentTextResponse.includes('Yes') ? 'Yes' : 'No';
                            setCurrentTextResponse(e.target.value ? `${baseAnswer} - ${e.target.value}` : baseAnswer);
                          }}
                        />
                      )}
                    </div>
                  ) : currentQuestion.type === 'scaling' ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-center mb-4">
                          <span className={`text-3xl font-bold text-purple-500`}>
                            {currentTextResponse || '5'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={currentTextResponse || '5'}
                          onChange={(e) => setCurrentTextResponse(e.target.value)}
                          className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-green-400 to-red-500"
                        />
                        <div className="flex justify-between text-sm mt-2">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>1</span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>10</span>
                        </div>
                      </div>
                      <textarea
                        placeholder="Can you tell me more about this rating?"
                        rows={2}
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        onChange={(e) => {
                          const rating = currentTextResponse?.split(' - ')[0] || '5';
                          setCurrentTextResponse(e.target.value ? `${rating} - ${e.target.value}` : rating);
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      placeholder={
                        currentQuestion.type === 'open' ? "Please share your thoughts and feelings..." :
                        currentQuestion.type === 'behavioral' ? "Describe what you typically do..." :
                        currentQuestion.type === 'reflective' ? "Take a moment to reflect..." :
                        currentQuestion.type === 'future' ? "Imagine your ideal situation..." :
                        "Please type your answer here..."
                      }
                      value={currentTextResponse}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      onChange={(e) => setCurrentTextResponse(e.target.value)}
                    />
                  )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentQuestionIndex === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitTextResponse}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  >
                    {currentQuestionIndex === currentAssessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                  </motion.button>
                </div>
                </div>
              </motion.div>
            </div>
          )}

        {/* Plan Selection Modal - Full Screen Popup */}
        <AnimatePresence>
          {showPlanSelection && generatedPlan && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowPlanSelection(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="p-6">
                  <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Your Personalized {generatedPlan.issue} Plan
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {generatedPlan.description}
                  </p>
                  <div className="flex items-center justify-center space-x-4 mt-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-500">{generatedPlan.planDuration}</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-500">{generatedPlan.recommendations.length}</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Therapies</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xl font-bold ${
                        generatedPlan.severity === 'mild' ? 'text-green-500' :
                        generatedPlan.severity === 'moderate' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {generatedPlan.severity}
                      </p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Severity</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Recommended Therapies:
                  </h4>
                  {generatedPlan.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${rec.color} flex items-center justify-center`}>
                        <rec.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-sm font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {rec.title}
                        </h5>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        Priority {rec.priority}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPlanSelection(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Maybe Later
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={acceptPlan}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Start My Plan</span>
                  </motion.button>
                </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`px-4 pb-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => startAssessment('anxiety-disorders')}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              Start Assessment
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatbotPage;