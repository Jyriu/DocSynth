```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String  name
        +String  email
        +String  passwordHash
        +Date    createdAt
    }

    class Document {
        +ObjectId _id
        +String  title
        +String  source
        +String  rawText
        +ObjectId ownerId
        +Date    createdAt
    }

    class Summary {
        +ObjectId _id
        +ObjectId documentId
        +String  summaryText
        +String  status
        +Number  tokensUsed
        +Date    createdAt
    }

    User "1" --> "many" Document
    Document "1" --> "many" Summary