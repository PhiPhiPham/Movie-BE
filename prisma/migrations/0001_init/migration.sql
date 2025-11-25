-- Initial schema for Movie Discovery Service

CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Genre" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Movie" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "synopsis" TEXT,
    "runtime" INTEGER,
    "director" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Actor" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "MovieGenre" (
    "movieId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    PRIMARY KEY ("movieId", "genreId"),
    CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "MovieActor" (
    "movieId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "role" TEXT,
    PRIMARY KEY ("movieId", "actorId"),
    CONSTRAINT "MovieActor_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovieActor_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Country" (
    "code" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "MovieAvailability" (
    "movieId" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    PRIMARY KEY ("movieId", "countryCode"),
    CONSTRAINT "MovieAvailability_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovieAvailability_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "movie_availability_country_movie_idx" ON "MovieAvailability" ("countryCode", "movieId");

CREATE TABLE "SavedMovie" (
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,
    "dateAdded" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "SavedMovie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedMovie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "saved_movies_user_date_added_idx" ON "SavedMovie" ("userId", "dateAdded");
