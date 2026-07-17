# Verbly API Endpoints

## Authentication Required

All endpoints below require authentication (JWT token in cookies).

## Words Endpoints

### `GET /api/v1/words/today`

Get today's featured word.

**Response:**

```json
{
  "success": true,
  "message": "Today's word fetched successfully",
  "data": {
    "id": 1,
    "word": "serendipity",
    "definition": "The occurrence of events by chance in a happy or beneficial way",
    "pronunciation": "/ˌserənˈdipədē/",
    "examples": [
      "Finding this book was pure serendipity",
      "Their meeting was serendipity"
    ],
    "date": "2024-12-07",
    "completed": false,
    "learned": false
  }
}
```

### `POST /api/v1/words/today/complete`

Mark today's word as completed and update streak.

**Response:**

```json
{
  "success": true,
  "message": "Word completed successfully",
  "data": {
    "completed": true,
    "streak": {
      "currentStreak": 5,
      "longestStreak": 12
    }
  }
}
```

### `POST /api/v1/words/save`

Save a word to user's saved words.

**Request:**

```json
{
  "wordId": 1
}
```

### `GET /api/v1/words/saved`

Get user's saved words.

### `POST /api/v1/words/learn`

Mark a word as learned (new endpoint you requested!).

**Request:**

```json
{
  "wordId": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Word marked as learned successfully",
  "data": {
    "id": 1,
    "userId": "user-id",
    "dailyWordId": 1,
    "learnedAt": "2024-12-07T10:30:00Z"
  }
}
```

### `GET /api/v1/words/learned`

Get user's learned words.

**Response:**

```json
{
  "success": true,
  "message": "Learned words fetched successfully",
  "data": [
    {
      "id": 1,
      "word": "serendipity",
      "definition": "The occurrence of events by chance in a happy or beneficial way",
      "pronunciation": "/ˌserənˈdipədē/",
      "examples": ["Finding this book was pure serendipity"],
      "learnedAt": "2024-12-07T10:30:00Z",
      "originalDate": "2024-12-07"
    }
  ]
}
```

### `GET /api/v1/words/stats`

Get user's learning statistics.

**Response:**

```json
{
  "success": true,
  "message": "Learning statistics fetched successfully",
  "data": {
    "savedWordsCount": 15,
    "learnedWordsCount": 8,
    "completedDaysCount": 25
  }
}
```

## Profile Endpoints

### `GET /api/v1/profile`

Get user profile with streak and learning statistics.

**Response:**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarUrl": "https://...",
      "subscriptionType": "free",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "streak": {
      "currentStreak": 5,
      "longestStreak": 12,
      "lastCompletedDate": "2024-12-06",
      "completedToday": false
    },
    "learning": {
      "savedWordsCount": 15,
      "learnedWordsCount": 8,
      "completedDaysCount": 25
    }
  }
}
```

### `GET /api/v1/profile/streak`

Get detailed streak statistics.

## Admin Endpoints

### `POST /api/v1/words/admin/add`

Add a new daily word (admin only).

**Request:**

```json
{
  "word": "serendipity",
  "definition": "The occurrence of events by chance in a happy or beneficial way",
  "pronunciation": "/ˌserənˈdipədē/",
  "examples": [
    "Finding this book was pure serendipity",
    "Their meeting was serendipity"
  ],
  "date": "2024-12-07"
}
```

### `GET /api/v1/words/admin/all`

Get all daily words (admin only).

## How Streaks Work

1. **On Signup**: A new streak record is automatically created with `currentStreak: 0`
2. **Completing Today's Word**: When `/words/today/complete` is called:
   - If user completed yesterday: `currentStreak` increments by 1
   - If user didn't complete yesterday: `currentStreak` resets to 1
   - `longestStreak` is updated if current streak is higher
3. **Streak Reset**: Automatically happens when user misses a day

## Word Learning Flow

1. **Daily Word**: One word per day for all users
2. **Complete**: Mark today's word as "seen/completed" (updates streak)
3. **Save**: Save interesting words to review later
4. **Learn**: Mark words as "learned" when user has mastered them

The "learned" endpoint you requested lets users track their actual learning progress beyond just daily completion!
