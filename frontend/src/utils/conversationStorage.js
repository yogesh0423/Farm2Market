const STORAGE_KEY = 'farm2market_conversations';

const readConversations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read conversations:', error);

    return [];
  }
};

const writeConversations = (conversations) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations)
    );
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
};

export const createConversationId = (
  farmerName,
  productTitle
) => {
  return `${farmerName || 'farmer'}::${productTitle || 'produce'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getConversations = () => {
  return readConversations();
};

export const getConversation = (conversationId) => {
  return (
    readConversations().find(
      (conversation) =>
        conversation.id === conversationId
    ) || null
  );
};

export const upsertConversation = (conversation) => {
  const conversations = readConversations();

  const existingIndex = conversations.findIndex(
    (item) => item.id === conversation.id
  );

  if (existingIndex >= 0) {
    conversations[existingIndex] = {
      ...conversations[existingIndex],
      ...conversation,
      updatedAt: new Date().toISOString()
    };
  } else {
    conversations.unshift({
      ...conversation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  writeConversations(conversations);

  return existingIndex >= 0
    ? conversations[existingIndex]
    : conversations[0];
};

export const updateConversationMessages = (
  conversationId,
  messages
) => {
  const conversations = readConversations();

  const index = conversations.findIndex(
    (conversation) =>
      conversation.id === conversationId
  );

  if (index === -1) {
    return null;
  }

  conversations[index] = {
    ...conversations[index],
    messages,
    updatedAt: new Date().toISOString()
  };

  writeConversations(conversations);

  return conversations[index];
};