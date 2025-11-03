/**
 * Chat Redux Slice
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {ChatState} from '../types';
import {chatService} from '../services/chat.service';
import {Message, Conversation} from '@types';
import {parseErrorMessage} from '@utils';

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  typing: {},
  connected: false,
  loading: false,
  error: null,
};

export const connectChat = createAsyncThunk(
  'chat/connect',
  async (token: string, {rejectWithValue}) => {
    try {
      await chatService.connect(token);
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (_, {rejectWithValue}) => {
    try {
      return await chatService.getConversations();
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (conversationId: string, {rejectWithValue}) => {
    try {
      const messages = await chatService.getMessages(conversationId);
      return {conversationId, messages};
    } catch (error) {
      return rejectWithValue(parseErrorMessage(error));
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const {conversationId} = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);
    },
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversation = action.payload;
    },
    setTyping: (state, action: PayloadAction<{conversationId: string; isTyping: boolean}>) => {
      state.typing[action.payload.conversationId] = action.payload.isTyping;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(connectChat.fulfilled, state => {
      state.connected = true;
    });
    builder.addCase(connectChat.rejected, state => {
      state.connected = false;
    });
    builder.addCase(getConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
    });
    builder.addCase(getMessages.fulfilled, (state, action) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
    });
  },
});

export const {addMessage, setCurrentConversation, setTyping, clearError} = chatSlice.actions;
export default chatSlice.reducer;
