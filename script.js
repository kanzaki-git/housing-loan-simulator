/* =========================
   入力欄
========================= */

const rentInput =
  document.getElementById("rent");

const additionalPaymentInput =
  document.getElementById("additional-payment");

const ownFundsInput =
  document.getElementById("own-funds");

const repaymentYearsInput =
  document.getElementById("repayment-years");

const interestRateInput =
  document.getElementById("interest-rate");

const buildingPriceInput =
  document.getElementById("building-price");

const expensesInput =
  document.getElementById("expenses");


/* =========================
   自動計算表示
========================= */

const monthlyBudgetElement =
  document.getElementById("monthly-budget");

const loanAmountElement =
  document.getElementById("loan-amount");

const totalBudgetElement =
  document.getElementById("total-budget");

const monthlyPaymentElement =
  document.getElementById("monthly-payment");

const budgetSummaryTotalElement =
  document.getElementById("budget-summary-total");

const landPriceElement =
  document.getElementById("land-price");


/* =========================
   円グラフ
========================= */

const chartElement =
  document.getElementById("budget-chart");

const chartTotalBudgetElement =
  document.getElementById("chart-total-budget");

const chartBuildingPriceElement =
  document.getElementById("chart-building-price");

const chartLandPriceElement =
  document.getElementById("chart-land-price");

const chartOtherPriceElement =
  document.getElementById("chart-other-price");


const buildingChartLabel =
  document.getElementById("building-chart-label");

const landChartLabel =
  document.getElementById("land-chart-label");

const costChartLabel =
  document.getElementById("cost-chart-label");

const buildingChartAmount =
  document.getElementById("building-chart-amount");

const landChartAmount =
  document.getElementById("land-chart-amount");

const costChartAmount =
  document.getElementById("cost-chart-amount");


/* =========================
   試算結果
========================= */

const resultLoanAmountElement =
  document.getElementById("result-loan-amount");

const resultOwnFundsElement =
  document.getElementById("result-own-funds");

const resultYearsElement =
  document.getElementById("result-years");

const resultRateElement =
  document.getElementById("result-rate");

const resultTotalBudgetElement =
  document.getElementById("result-total-budget");


/* =========================
   その他
========================= */

const budgetWarningElement =
  document.getElementById("budget-warning");

const validationSummaryElement =
  document.getElementById("validation-summary");

const otherCostList =
  document.getElementById("other-cost-list");

const otherCostTotalElement =
  document.getElementById("other-cost-total");

const addCostButton =
  document.getElementById("add-cost-button");

const resetButton =
  document.getElementById("reset-button");


/* =========================
   入力されているか
========================= */

function hasValue(input) {
  return (
    input &&
    input.value.trim() !== ""
  );
}


/* =========================
   その他費用合計
========================= */

function getOtherCostsTotal() {
  const inputs =
    document.querySelectorAll(
      ".other-cost-amount"
    );

  let total = 0;

  inputs.forEach((input) => {
    total += Number(input.value) || 0;
  });

  return total;
}


/* =========================
   月々返済可能額から
   住宅ローン元金を逆算
========================= */

function calculateLoanAmount(
  monthlyPayment,
  years,
  annualInterestRate
) {
  if (
    monthlyPayment <= 0 ||
    years <= 0 ||
    annualInterestRate < 0
  ) {
    return 0;
  }

  const numberOfPayments =
    years * 12;

  const monthlyInterestRate =
    annualInterestRate /
    100 /
    12;


  /*
    金利0%の場合

    借入額 =
    月々返済額 × 支払回数
  */

  if (monthlyInterestRate === 0) {
    return (
      monthlyPayment *
      numberOfPayments
    );
  }


  /*
    元利均等返済の式を逆算して
    借入元金を求める
  */

  return (
    monthlyPayment *
    (
      1 -
      Math.pow(
        1 + monthlyInterestRate,
        -numberOfPayments
      )
    ) /
    monthlyInterestRate
  );
}


/* =========================
   住宅ローンから
   月々返済額を計算
========================= */

function calculateMonthlyPayment(
  loanAmount,
  years,
  annualInterestRate
) {
  if (
    loanAmount <= 0 ||
    years <= 0 ||
    annualInterestRate < 0
  ) {
    return 0;
  }


  const principal =
    loanAmount * 10000;

  const numberOfPayments =
    years * 12;

  const monthlyInterestRate =
    annualInterestRate /
    100 /
    12;


  if (monthlyInterestRate === 0) {
    return (
      principal /
      numberOfPayments
    );
  }


  return (
    principal *
    (
      monthlyInterestRate *
      Math.pow(
        1 + monthlyInterestRate,
        numberOfPayments
      )
    ) /
    (
      Math.pow(
        1 + monthlyInterestRate,
        numberOfPayments
      ) - 1
    )
  );
}


/* =========================
   入力チェック
========================= */

function validateInputs() {
  const errors = [];

  const numberInputs = [
    rentInput,
    additionalPaymentInput,
    ownFundsInput,
    repaymentYearsInput,
    interestRateInput,
    buildingPriceInput,
    expensesInput
  ];


  document
    .querySelectorAll(
      'input[type="number"]'
    )
    .forEach((input) => {
      input.classList.remove(
        "input-error"
      );
    });


  numberInputs.forEach((input) => {
    if (!input) {
      return;
    }


    if (
      hasValue(input) &&
      Number(input.value) < 0
    ) {
      input.classList.add(
        "input-error"
      );

      errors.push(
        "金額や金利には0以上の値を入力してください。"
      );
    }
  });


  if (
    hasValue(repaymentYearsInput) &&
    Number(repaymentYearsInput.value) <= 0
  ) {
    repaymentYearsInput.classList.add(
      "input-error"
    );

    errors.push(
      "返済期間は1年以上を入力してください。"
    );
  }


  document
    .querySelectorAll(
      ".other-cost-amount"
    )
    .forEach((input) => {

      if (
        hasValue(input) &&
        Number(input.value) < 0
      ) {
        input.classList.add(
          "input-error"
        );

        errors.push(
          "その他費用には0以上の値を入力してください。"
        );
      }
    });


  const uniqueErrors =
    [...new Set(errors)];


  if (validationSummaryElement) {

    if (uniqueErrors.length === 0) {

      validationSummaryElement.hidden =
        true;

      validationSummaryElement.innerHTML =
        "";

    } else {

      validationSummaryElement.hidden =
        false;

      validationSummaryElement.innerHTML =
        uniqueErrors
          .map(
            (error) =>
              `・${error}`
          )
          .join("<br>");
    }
  }


  return uniqueErrors.length === 0;
}


/* =========================
   円グラフラベル
========================= */

function positionChartLabel(
  element,
  startAngle,
  endAngle,
  percent
) {
  if (!element) {
    return;
  }


  const middleAngle =
    (startAngle + endAngle) / 2;


  const radians =
    (
      middleAngle - 90
    ) *
    Math.PI /
    180;


  const isSmall =
    percent < 0.08;


  const radius =
    isSmall
      ? 170
      : 103;


  const x =
    Math.cos(radians) *
    radius;

  const y =
    Math.sin(radians) *
    radius;


  element.style.transform =
    `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
    `;


  element.classList.toggle(
    "is-outside",
    isSmall
  );
}


/* =========================
   メイン計算
========================= */

function calculate() {

  validateInputs();


  const rent =
    Number(rentInput?.value) || 0;

  const additionalPayment =
    Number(additionalPaymentInput?.value) || 0;

  const ownFunds =
    Number(ownFundsInput?.value) || 0;

  const repaymentYears =
    Number(repaymentYearsInput?.value) || 0;

  const annualInterestRate =
    Number(interestRateInput?.value) || 0;

  const buildingPrice =
    Number(buildingPriceInput?.value) || 0;

  const expenses =
    Number(expensesInput?.value) || 0;

  const otherCosts =
    getOtherCostsTotal();


  /* =========================
     月々返済可能額
  ========================= */

  const monthlyBudget =
    rent +
    additionalPayment;


  const hasMonthlyBudget =
    hasValue(rentInput) ||
    hasValue(additionalPaymentInput);


  if (monthlyBudgetElement) {
    monthlyBudgetElement.textContent =
      hasMonthlyBudget
        ? monthlyBudget.toLocaleString()
        : "－";
  }


  /* =========================
     住宅ローン自動計算
  ========================= */

  const hasLoanCalculation =
    hasMonthlyBudget &&
    monthlyBudget > 0 &&
    hasValue(repaymentYearsInput) &&
    repaymentYears > 0 &&
    hasValue(interestRateInput) &&
    annualInterestRate >= 0;


  let loanAmount = 0;


  if (hasLoanCalculation) {

    const loanAmountYen =
      calculateLoanAmount(
        monthlyBudget,
        repaymentYears,
        annualInterestRate
      );


    /*
      万円単位で切り捨てる。

      例：
      2,777.8万円
      ↓
      2,777万円
    */

    loanAmount =
      Math.floor(
        loanAmountYen /
        10000
      );
  }


  if (loanAmountElement) {
    loanAmountElement.textContent =
      hasLoanCalculation
        ? loanAmount.toLocaleString()
        : "－";
  }


  /* =========================
     総予算
  ========================= */

  const totalBudget =
    loanAmount +
    ownFunds;


  const hasTotalBudget =
    hasLoanCalculation ||
    hasValue(ownFundsInput);


  if (totalBudgetElement) {
    totalBudgetElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  if (budgetSummaryTotalElement) {
    budgetSummaryTotalElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  if (resultTotalBudgetElement) {
    resultTotalBudgetElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  /* =========================
     月々返済額
  ========================= */

  const monthlyPayment =
    hasLoanCalculation
      ? calculateMonthlyPayment(
          loanAmount,
          repaymentYears,
          annualInterestRate
        )
      : 0;


  if (monthlyPaymentElement) {
    monthlyPaymentElement.textContent =
      hasLoanCalculation
        ? Math.round(
            monthlyPayment
          ).toLocaleString()
        : "－";
  }


  /* =========================
     その他費用
  ========================= */

  if (otherCostTotalElement) {
    otherCostTotalElement.textContent =
      otherCosts.toLocaleString();
  }


  /* =========================
     土地価格
  ========================= */

  const landPrice =
    totalBudget -
    buildingPrice -
    expenses -
    otherCosts;


  if (landPriceElement) {
    landPriceElement.textContent =
      hasTotalBudget
        ? landPrice.toLocaleString()
        : "－";
  }


  /* =========================
     試算結果一覧
  ========================= */

  if (resultLoanAmountElement) {
    resultLoanAmountElement.textContent =
      hasLoanCalculation
        ? loanAmount.toLocaleString()
        : "－";
  }


  if (resultOwnFundsElement) {
    resultOwnFundsElement.textContent =
      hasValue(ownFundsInput)
        ? ownFunds.toLocaleString()
        : "－";
  }


  if (resultYearsElement) {
    resultYearsElement.textContent =
      hasValue(repaymentYearsInput)
        ? repaymentYears.toLocaleString()
        : "－";
  }


  if (resultRateElement) {
    resultRateElement.textContent =
      hasValue(interestRateInput)
        ? annualInterestRate.toLocaleString()
        : "－";
  }


  /* =========================
     土地マイナス警告
  ========================= */

  if (budgetWarningElement) {
    budgetWarningElement.hidden =
      !(
        hasTotalBudget &&
        landPrice < 0
      );
  }


  /* =========================
     円グラフ
  ========================= */

  const totalCosts =
    expenses +
    otherCosts;


  if (chartTotalBudgetElement) {
    chartTotalBudgetElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  if (chartBuildingPriceElement) {
    chartBuildingPriceElement.textContent =
      buildingPrice.toLocaleString();
  }


  if (chartLandPriceElement) {
    chartLandPriceElement.textContent =
      hasTotalBudget
        ? Math.max(
            landPrice,
            0
          ).toLocaleString()
        : "－";
  }


  if (chartOtherPriceElement) {
    chartOtherPriceElement.textContent =
      totalCosts.toLocaleString();
  }


  if (
    chartElement &&
    totalBudget > 0 &&
    landPrice >= 0
  ) {

    const buildingPercent =
      buildingPrice /
      totalBudget;

    const landPercent =
      landPrice /
      totalBudget;

    const costPercent =
      totalCosts /
      totalBudget;


    const buildingEnd =
      buildingPercent *
      360;

    const landEnd =
      buildingEnd +
      landPercent *
      360;


    chartElement.style.background =
      `
        conic-gradient(
          #1d537f
          0deg
          ${buildingEnd}deg,

          #79bdf2
          ${buildingEnd}deg
          ${landEnd}deg,

          #74d9b7
          ${landEnd}deg
          360deg
        )
      `;


    if (buildingChartAmount) {
      buildingChartAmount.textContent =
        buildingPrice.toLocaleString();
    }


    if (landChartAmount) {
      landChartAmount.textContent =
        landPrice.toLocaleString();
    }


    if (costChartAmount) {
      costChartAmount.textContent =
        totalCosts.toLocaleString();
    }


    positionChartLabel(
      buildingChartLabel,
      0,
      buildingEnd,
      buildingPercent
    );


    positionChartLabel(
      landChartLabel,
      buildingEnd,
      landEnd,
      landPercent
    );


    positionChartLabel(
      costChartLabel,
      landEnd,
      360,
      costPercent
    );


    if (buildingChartLabel) {
      buildingChartLabel.style.display =
        buildingPrice > 0
          ? "flex"
          : "none";
    }


    if (landChartLabel) {
      landChartLabel.style.display =
        landPrice > 0
          ? "flex"
          : "none";
    }


    if (costChartLabel) {
      costChartLabel.style.display =
        totalCosts > 0
          ? "flex"
          : "none";
    }

  } else if (chartElement) {

    chartElement.style.background =
      "#e5e7eb";


    [
      buildingChartLabel,
      landChartLabel,
      costChartLabel
    ].forEach((label) => {

      if (label) {
        label.style.display =
          "none";
      }

    });
  }
}


/* =========================
   数値変更時
========================= */

document.addEventListener(
  "input",
  (event) => {

    if (
      event.target.matches(
        'input[type="number"]'
      )
    ) {
      calculate();
    }

  }
);


/* =========================
   その他費用追加
========================= */

if (addCostButton) {

  addCostButton.addEventListener(
    "click",
    () => {

      const row =
        document.createElement(
          "div"
        );


      row.classList.add(
        "other-cost-row"
      );


      row.innerHTML = `
        <input
          type="text"
          class="other-cost-name"
          placeholder="項目名"
        >

        <div class="input-with-unit">
          <input
            type="number"
            class="other-cost-amount"
            min="0"
            placeholder="金額"
          >

          <span>
            万円
          </span>
        </div>

        <button
          type="button"
          class="delete-cost-button"
        >
          削除
        </button>
      `;


      otherCostList.appendChild(
        row
      );
    }
  );
}


/* =========================
   その他費用削除
========================= */

if (otherCostList) {

  otherCostList.addEventListener(
    "click",
    (event) => {

      const deleteButton =
        event.target.closest(
          ".delete-cost-button"
        );


      if (!deleteButton) {
        return;
      }


      const row =
        deleteButton.closest(
          ".other-cost-row"
        );


      if (row) {
        row.remove();

        calculate();
      }

    }
  );
}


/* =========================
   リセット
========================= */

if (resetButton) {

  resetButton.addEventListener(
    "click",
    () => {

      document
        .querySelectorAll(
          'input[type="number"]'
        )
        .forEach((input) => {

          input.value = "";

          input.classList.remove(
            "input-error"
          );

        });


      if (validationSummaryElement) {

        validationSummaryElement.hidden =
          true;

        validationSummaryElement.innerHTML =
          "";
      }


      calculate();
    }
  );
}


/* =========================
   初期表示
========================= */

calculate();
