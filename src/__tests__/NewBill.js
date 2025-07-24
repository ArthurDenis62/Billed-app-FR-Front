/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

jest.mock("../app/Store.js")

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe("Given I am on NewBill Page", () => {
  beforeEach(() => {
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
  })

  test("Then uploading a valid image file calls store.bills().create", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html
    const mockCreate = jest.fn().mockResolvedValue({ fileUrl: "url", key: "key", filePath: "url" });
    const store = { bills: () => ({ create: mockCreate }) };
    const localStorage = { getItem: () => JSON.stringify({ email: "test@test.com" }) };
    const container = new NewBill({ document, onNavigate: jest.fn(), store, localStorage });
    const file = new File(["file content"], "image.png", { type: "image/png" });
    const input = document.querySelector(`input[data-testid="file"]`);
    Object.defineProperty(input, 'files', { value: [file], writable: false });
    const event = { preventDefault: jest.fn(), target: { value: "C:\\fakepath\\image.png" } };
    await container.handleChangeFile(event);
    expect(mockCreate).toHaveBeenCalled();
  });

  test("Then submitting the form calls updateBill", () => {
    const mockUpdate = jest.fn();
    const store = { bills: () => ({ update: mockUpdate }) };
    const localStorage = { getItem: () => JSON.stringify({ email: "test@test.com" }) };
    document.body.innerHTML = `
      <form data-testid="form-new-bill">
        <select data-testid="expense-type"><option value="Transports">Transports</option></select>
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
    const container = new NewBill({ document, onNavigate: jest.fn(), store, localStorage });
    container.fileUrl = "url";
    container.fileName = "file.png";
    container.updateBill = jest.fn();
    form.dispatchEvent(new Event("submit"));
    expect(container.updateBill).toHaveBeenCalled();
  });

  test("Then handleChangeFile should reject invalid file extension", () => {
    const html = NewBillUI()
    document.body.innerHTML = html
    const store = { bills: () => ({ create: jest.fn() }) };
    const localStorage = { getItem: () => JSON.stringify({ email: "test@test.com" }) };
    const container = new NewBill({ document, onNavigate: jest.fn(), store, localStorage });
    const input = document.querySelector(`input[data-testid="file"]`);
    input.setCustomValidity = jest.fn();
    input.reportValidity = jest.fn();
    const file = new File(["file content"], "document.pdf", { type: "application/pdf" });
    Object.defineProperty(input, 'files', { value: [file], writable: false });
    const event = { preventDefault: jest.fn(), target: { value: "C:\\fakepath\\document.pdf" } };
    container.handleChangeFile(event);
    expect(input.setCustomValidity).toHaveBeenCalledWith("Le fichier doit être au format jpg, jpeg ou png");
  });

  test("Then it should POST a new bill when form is submitted", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html
    
    const onNavigate = jest.fn()
    const store = {
      bills: () => ({
        create: jest.fn().mockResolvedValue({ fileUrl: "url", key: "key" }),
        update: jest.fn().mockResolvedValue({})
      })
    }
    
    const newBill = new NewBill({
      document, onNavigate, store, localStorage: window.localStorage
    })
    
    screen.getByTestId("expense-type").value = "Transports"
    screen.getByTestId("expense-name").value = "Vol Paris Londres"
    screen.getByTestId("datepicker").value = "2023-04-04"
    screen.getByTestId("amount").value = "400"
    screen.getByTestId("vat").value = "80"
    screen.getByTestId("pct").value = "20"
    screen.getByTestId("commentary").value = "Voyage professionnel"
    
    newBill.fileUrl = "url"
    newBill.fileName = "test.png"
    
    const form = screen.getByTestId("form-new-bill")
    const event = { preventDefault: jest.fn(), target: form }
    
    newBill.handleSubmit(event)
    
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
  })
});
