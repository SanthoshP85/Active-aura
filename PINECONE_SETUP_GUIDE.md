# Pinecone Setup Quick Start

## What's Done ✅

- **pineconeService.js** created - Singleton vector store service
- **ragService.js** updated - Now uses Pinecone instead of Upstash
- **package.json** updated - Added `@pinecone-database/pinecone: ^3.0.0`
- **.env** updated - Added Pinecone placeholder variables

## What You Need To Do

### 1. Get Pinecone Credentials

1. Go to https://www.pinecone.io/ and sign up (free tier available)
2. Create a new index:
   - Name: `activeaura-fitness-index`
   - Dimension: `384` (matches HuggingFace embeddings)
   - Metric: `cosine`
   - Region: Pick closest to you
3. Copy your API Key from the console

### 2. Update .env

Edit `backend/.env`:

```env
# Replace this:
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX_NAME=activeaura-fitness-index

# With your actual values:
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxx
PINECONE_INDEX_NAME=activeaura-fitness-index
```

### 3. Install & Run

```bash
cd backend
npm install
npm run dev
```

Look for this log message:

```
✅ Pinecone Vector Store initialized
```

## How It Works

### When User Creates a Goal:

```
Goal Created → Summary Generated → HF Embeddings → Stored in Pinecone
```

### When Insights are Generated:

```
Query Received → HF Embeddings → Search Pinecone → Get Context → Better AI Insights
```

## Testing

1. Start backend: `npm run dev`
2. Create a new fitness goal from frontend
3. Check backend logs for:
   - ✅ Pinecone Vector Store initialized
   - ✅ Vector stored in Pinecone: [id]
4. Create insights - they'll now use RAG context from Pinecone

## API Reference

### storeFitnessSummary(userId, summary, dataType)

Stores a fitness summary in Pinecone with embeddings

```javascript
await storeFitnessSummary("user123", "User fitness goals and progress", "goal");
```

### retrieveContext(userId, query, topK)

Retrieves similar fitness context for RAG

```javascript
const context = await retrieveContext("user123", "calorie tips", 3);
// Returns top 3 relevant fitness summaries
```

## Files Changed

```
backend/
├── utils/
│   └── pineconeService.js          (NEW) - Pinecone vector operations
├── modules/
│   └── rag/
│       └── ragService.js           (UPDATED) - Uses Pinecone now
├── .env                            (UPDATED) - Pinecone vars
└── package.json                    (UPDATED) - Added @pinecone-database/pinecone
```

## Troubleshooting

### Error: "Pinecone not configured"

- Check PINECONE_API_KEY is set
- Check PINECONE_INDEX_NAME matches your index

### Error: "Failed to initialize Pinecone"

- Verify API key is valid
- Verify index exists in Pinecone console
- Check your Pinecone account is active

### Vector storage failing

- Check index dimension is 384
- Verify API key has right permissions
- Check network connectivity

### No context retrieved

- Create a goal first to populate vectors
- Wait a moment for embeddings to process
- Check userId matches in queries

## Features Enabled by Pinecone

✅ RAG Context - Retrieve relevant fitness history for better insights
✅ Semantic Search - Find related fitness data by meaning
✅ User Isolation - Separate vectors per user securely
✅ Scalable - Pinecone handles millions of vectors
✅ Free Tier - Start for free with 1M API calls/month

---

**Need Help?** Check PINECONE_MIGRATION.md for detailed architecture
