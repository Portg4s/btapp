const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

type ItunesTrackResult = {
  artistName?: string;
  artworkUrl100?: string;
  collectionCensoredName?: string;
  collectionName?: string;
  country?: string;
  kind?: string;
  previewUrl?: string;
  primaryGenreName?: string;
  trackCensoredName?: string;
  trackId?: number;
  trackName?: string;
  wrapperType?: string;
};

type ItunesSearchResponse = {
  results?: ItunesTrackResult[];
};

function isItunesSearchResponse(value: unknown): value is ItunesSearchResponse {
  return typeof value === "object" && value !== null && "results" in value;
}

function getLargeArtworkUrl(artworkUrl?: string) {
  return artworkUrl?.replace("100x100bb", "600x600bb");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term")?.trim();

  if (!term) {
    return Response.json(
      { error: "Le parametre term est requis.", results: [] },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    country: searchParams.get("country") ?? "FR",
    entity: "song",
    explicit: "No",
    limit: searchParams.get("limit") ?? "25",
    media: "music",
    term,
  });

  try {
    const response = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        {
          error: `iTunes a repondu avec le statut ${response.status}.`,
          results: [],
        },
        { status: response.status },
      );
    }

    const data: unknown = await response.json();

    if (!isItunesSearchResponse(data) || !Array.isArray(data.results)) {
      return Response.json(
        { error: "Format de reponse iTunes inattendu.", results: [] },
        { status: 502 },
      );
    }

    return Response.json({
      results: data.results
        .filter((track) => track.previewUrl && track.trackName && track.artistName)
        .map((track) => ({
          artist: track.artistName,
          artworkUrl: getLargeArtworkUrl(track.artworkUrl100),
          audioPreviewUrl: track.previewUrl,
          collectionCensoredName: track.collectionCensoredName,
          collectionName: track.collectionName,
          country: track.country,
          id: track.trackId,
          kind: track.kind,
          primaryGenreName: track.primaryGenreName,
          sourceTitle: track.collectionName,
          trackCensoredName: track.trackCensoredName,
          title: track.trackName,
          wrapperType: track.wrapperType,
        })),
    });
  } catch {
    return Response.json(
      {
        error: "Impossible de contacter iTunes depuis le serveur.",
        results: [],
      },
      { status: 502 },
    );
  }
}
