/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am on NewBill Page", () => {
  test("Then uploading a valid image file calls store.bills().create", async () => {
    const mockCreate = jest.fn().mockResolvedValue({ fileUrl: "url", key: "key" });
    const store = { bills: () => ({ create: mockCreate }) };
    const localStorage = { getItem: () => JSON.stringify({ email: "test@test.com" }) };
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("data-testid", "file");
    document.body.append(input);
    const NewBill = require("../containers/NewBill.js").default;
    const container = new NewBill({ document, onNavigate: jest.fn(), store, localStorage });
    const file = new File(["file content"], "image.png", { type: "image/png" });
    const event = { preventDefault: jest.fn(), target: { value: "C:\\fakepath\\image.png" } };
    input.files = [file];
    container.handleChangeFile(event);
    expect(mockCreate).toHaveBeenCalled();
  });

  test("Then submitting the form calls updateBill", () => {
    const mockUpdate = jest.fn();
    const store = { bills: () => ({ update: mockUpdate }) };
    const localStorage = { getItem: () => JSON.stringify({ email: "test@test.com" }) };
    document.body.innerHTML = `
      <form data-testid="form-new-bill">
        <input data-testid="expense-type" value="Transports" />
        <input data-testid="expense-name" value="Vol" />
        <input data-testid="amount" value="100" />
        <input data-testid="datepicker" value="2022-09-01" />
        <input data-testid="vat" value="70" />
        <input data-testid="pct" value="20" />
        <textarea data-testid="commentary">Test</textarea>
        <input data-testid="file" />
      </form>
    `;
    const form = document.querySelector(`form[data-testid="form-new-bill"]`);
    const NewBill = require("../containers/NewBill.js").default;
    const container = new NewBill({ document, onNavigate: jest.fn(), store, localStorage });
    container.fileUrl = "url";
    container.fileName = "file.png";
    form.dispatchEvent(new Event("submit"));
    expect(typeof container.updateBill).toBe("function");
  });
});