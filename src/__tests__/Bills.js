/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
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
      const BillsContainer = require("../containers/Bills.js").default;
      new BillsContainer({ document, onNavigate: jest.fn(), store: null, localStorage });
      icon.click();
      expect($.fn.modal).toHaveBeenCalledWith("show");
    });
  });
});