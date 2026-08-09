import { TripData } from "@/types/trip.types";

export function exportTripsToCSV(trips: TripData[]) {
  const headers = [
    "Group",
    "Trip",
    "Destination",
    "Spent",
    "I Owe",
    "Received",
    "Status",
    "Date",
    "Companions",
  ];

  const escapeCSV = (value: unknown) => {
    const stringValue = String(value ?? "");

    // Escape quotes and wrap values containing commas,
    // quotes, or newlines in double quotes.
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const rows = trips.map((item) => {
    const balance = item.balance ?? 0;

    return [
      item.name,
      item.expense,
      item.category ?? "",

      // Amount I personally paid
      item.spent,

      // Amount I owe
      balance < 0 ? Math.abs(balance) : 0,

      // Amount others owe me
      balance > 0 ? balance : 0,

      item.status,

      new Date(item.createdAt).toLocaleDateString(),

      item.companions.join(", "),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) =>
      row.map(escapeCSV).join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "trips_export.csv";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}