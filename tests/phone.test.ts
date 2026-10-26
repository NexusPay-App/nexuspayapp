import {
  formatPhoneNumberToE164,
  validateE164PhoneNumber,
} from "../lib/phone-utils";
test.each([
  ["0712345678", "+254712345678"],
  ["+1 (415) 555-2671", "+14155552671"],
  ["00442071234567", "+442071234567"],
  ["+256 712 345678", "+256712345678"],
  ["254712345678", "+254712345678"],
])("normalizes %s without changing its country", (input, expected) =>
  expect(formatPhoneNumberToE164(input)).toBe(expected),
);
test.each(["123", "abc", "+254+712345678"])(
  "invalid phone %s cannot be submitted",
  (input) =>
    expect(validateE164PhoneNumber(formatPhoneNumberToE164(input))).toBe(false),
);
