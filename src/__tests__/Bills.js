/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import store from "../app/Store.js";

jest.mock("../app/Store");

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/\d{4}-\d{2}-\d{2}/)
        .map((a) => a.innerHTML);
      const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
      expect(dates).toEqual(sorted);
    });

    test("Then clicking on eye icon should open the modal", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const icon = document.createElement("div");
      icon.setAttribute("data-testid", "icon-eye");
      icon.setAttribute("data-bill-url", "https://test.com/bill.jpg");
      document.body.append(icon);
      const modal = document.createElement("div");
      modal.setAttribute("id", "modaleFile");
      modal.innerHTML = '<div class="modal-body"></div>';
      document.body.append(modal);
      const $ = require("jquery");
      global.$ = $;
      $.fn.modal = jest.fn();
      new Bills({ document, onNavigate: jest.fn(), store: null, localStorage });
      icon.click();
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });

    test("fetches bills from mock API GET", async () => {
      store.bills.mockImplementation(() => ({ list: () => Promise.resolve(bills) }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      expect(screen.getByTestId("tbody").children.length).toBeGreaterThan(0);
    });

    test("Then getBills() should return formatted bills and catch errors", async () => {
      store.bills.mockImplementation(() => ({ list: () => Promise.resolve(bills) }));
      const billInstance = new Bills({ document, onNavigate: jest.fn(), store, localStorage });
      const data = await billInstance.getBills();
      expect(data[0]).toHaveProperty("status");
      expect(Array.isArray(data)).toBe(true);
    });

    describe("When an error occurs on API", () => {
      test("fetches bills from an API and fails with 404 message error", async () => {
        store.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 404"))
        }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches bills from an API and fails with 500 message error", async () => {
        store.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 500"))
        }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});