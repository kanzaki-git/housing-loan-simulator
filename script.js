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

const buildingPriceTaxIncludedElement =
  document.getElementById(
    "building-price-tax-included"
  );

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
  document.getElementById(
    "budget-summary-total"
  );

const landPriceElement =
  document.getElementById("land-price");


/* =========================
   円グラフ
========================= */

const chartElement =
  document.getElementById("budget-chart");

const chartTotalBudgetElement =
  document.getElementById(
    "chart-total-budget"
  );

const chartBuildingPriceElement =
  document.getElementById(
    "chart-building-price"
  );

const chartLandPriceElement =
  document.getElementById(
    "chart-land-price"
  );

const chartOtherPriceElement =
  document.getElementById(
    "chart-other-price"
  );


const buildingChartLabel =
  document.getElementById(
    "building-chart-label"
  );

const landChartLabel =
  document.getElementById(
    "land-chart-label"
  );

const costChartLabel =
  document.getElementById(
    "cost-chart-label"
  );

const buildingChartAmount =
  document.getElementById(
    "building-chart-amount"
  );

const landChartAmount =
  document.getElementById(
    "land-chart-amount"
  );

const costChartAmount =
  document.getElementById(
    "cost-chart-amount"
  );


/* =========================
   試算結果
========================= */

const resultLoanAmountElement =
  document.getElementById(
    "result-loan-amount"
  );

const resultOwnFundsElement =
  document.getElementById(
    "result-own-funds"
  );

const resultYearsElement =
  document.getElementById(
    "result-years"
  );

const resultRateElement =
  document.getElementById(
    "result-rate"
  );

const resultTotalBudgetElement =
  document.getElementById(
    "result-total-budget"
  );


/* =========================
   その他
========================= */

const budgetWarningElement =
  document.getElementById(
    "budget-warning"
  );

const validationSummaryElement =
  document.getElementById(
    "validation-summary"
  );

const otherCostList =
  document.getElementById(
    "other-cost-list"
  );

const otherCostTotalElement =
  document.getElementById(
    "other-cost-total"
  );

const addCostButton =
  document.getElementById(
    "add-cost-button"
  );

const resetButton =
  document.getElementById(
    "reset-button"
  );


/* =========================
   土地エリア設定
========================= */

const landAreaListElement =
  document.getElementById(
    "land-area-list"
  );

const addLandAreaButton =
  document.getElementById(
    "add-land-area-button"
  );

const areaSettingMapElement =
  document.getElementById(
    "area-setting-map"
  );

const mapSettingGuideElement =
  document.getElementById(
    "map-setting-guide"
  );

const areaRangeControlsElement =
  document.getElementById(
    "area-range-controls"
  );

const selectedAreaNameElement =
  document.getElementById(
    "selected-area-name"
  );

const selectedAreaLocationElement =
  document.getElementById(
    "selected-area-location"
  );

const areaRadiusSlider =
  document.getElementById(
    "area-radius-slider"
  );

const areaRadiusInput =
  document.getElementById(
    "area-radius-input"
  );

const areaRadiusValueElement =
  document.getElementById(
    "area-radius-value"
  );

const saveAreaRangeButton =
  document.getElementById(
    "save-area-range-button"
  );

const cancelAreaRangeButton =
  document.getElementById(
    "cancel-area-range-button"
  );

const candidateLandBudgetElement =
  document.getElementById(
    "candidate-land-budget"
  );

const landCandidateMessageElement =
  document.getElementById(
    "land-candidate-message"
  );

const landCandidateListElement =
  document.getElementById(
    "land-candidate-list"
  );

const candidateMapElement =
  document.getElementById(
    "candidate-map"
  );

const LAND_AREAS_STORAGE_KEY =
  "housingLoanSimulatorLandAreas";

// 出雲市役所付近を初期表示の中心にする
const DEFAULT_MAP_CENTER = [
  35.366667,
  132.753333
];

const DEFAULT_MAP_ZOOM = 12;

let landAreas = [];
let currentLandPrice = null;
let selectedAreaId = null;

let pendingAreaLat = null;
let pendingAreaLng = null;
let pendingAreaRadius = 1500;

let areaSettingMap = null;
let areaSettingMarker = null;
let areaSettingCircle = null;

let candidateMap = null;
let candidateMarkers = [];


/* =========================
   デフォルト値
========================= */

const DEFAULT_EXPENSES = 200;

const DEFAULT_OTHER_COSTS = [
  100, // 外構
  330, // 付帯工事
  80,  // 地盤改良
  85,  // 浄化槽
  110, // 資材高騰
  100  // オプション
];


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
    total +=
      Number(input.value) || 0;
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

  if (
    monthlyInterestRate === 0
  ) {
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


  if (
    monthlyInterestRate === 0
  ) {
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
    Number(
      repaymentYearsInput.value
    ) <= 0
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


  if (
    validationSummaryElement
  ) {

    if (
      uniqueErrors.length === 0
    ) {

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


  return (
    uniqueErrors.length === 0
  );
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
    (
      startAngle +
      endAngle
    ) /
    2;


  const radians =
    (
      middleAngle -
      90
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
    Number(
      rentInput?.value
    ) || 0;


  const additionalPayment =
    Number(
      additionalPaymentInput?.value
    ) || 0;


  const ownFunds =
    Number(
      ownFundsInput?.value
    ) || 0;


  const repaymentYears =
    Number(
      repaymentYearsInput?.value
    ) || 0;


  const annualInterestRate =
    Number(
      interestRateInput?.value
    ) || 0;


  /*
    建物価格は
    税抜価格を入力
  */

  const buildingPrice =
    Number(
      buildingPriceInput?.value
    ) || 0;


  /*
    消費税10%を加えて
    税込価格を求める

    万円単位なので、
    小数第1位まで保持
  */

  const buildingPriceTaxIncluded =
    Math.round(
      buildingPrice *
      1.1 *
      10
    ) /
    10;


  const expenses =
    Number(
      expensesInput?.value
    ) || 0;


  const otherCosts =
    getOtherCostsTotal();


  /* =========================
     建物価格（税込）
  ========================= */

  if (
    buildingPriceTaxIncludedElement
  ) {
    buildingPriceTaxIncludedElement.textContent =
      hasValue(buildingPriceInput)
        ? buildingPriceTaxIncluded.toLocaleString()
        : "－";
  }


  /* =========================
     月々返済可能額
  ========================= */

  const monthlyBudget =
    rent +
    additionalPayment;


  const hasMonthlyBudget =
    hasValue(rentInput) ||
    hasValue(
      additionalPaymentInput
    );


  if (
    monthlyBudgetElement
  ) {
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
    hasValue(
      repaymentYearsInput
    ) &&
    repaymentYears > 0 &&
    hasValue(
      interestRateInput
    ) &&
    annualInterestRate >= 0;


  let loanAmount = 0;


  if (
    hasLoanCalculation
  ) {

    const loanAmountYen =
      calculateLoanAmount(
        monthlyBudget,
        repaymentYears,
        annualInterestRate
      );


    /*
      万円単位で切り捨て
    */

    loanAmount =
      Math.floor(
        loanAmountYen /
        10000
      );
  }


  if (
    loanAmountElement
  ) {
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
    hasValue(
      ownFundsInput
    );


  if (
    totalBudgetElement
  ) {
    totalBudgetElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  if (
    budgetSummaryTotalElement
  ) {
    budgetSummaryTotalElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  if (
    resultTotalBudgetElement
  ) {
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


  if (
    monthlyPaymentElement
  ) {
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

  if (
    otherCostTotalElement
  ) {
    otherCostTotalElement.textContent =
      otherCosts.toLocaleString();
  }


  /* =========================
     土地価格

     ※ 建物は税込価格を使用
  ========================= */

  const landPrice =
    totalBudget -
    buildingPriceTaxIncluded -
    expenses -
    otherCosts;


  if (
    landPriceElement
  ) {
    landPriceElement.textContent =
      hasTotalBudget
        ? landPrice.toLocaleString()
        : "－";
  }


  currentLandPrice =
    hasTotalBudget
      ? landPrice
      : null;

  updateLandAreaCandidates();


  /* =========================
     試算結果一覧
  ========================= */

  if (
    resultLoanAmountElement
  ) {
    resultLoanAmountElement.textContent =
      hasLoanCalculation
        ? loanAmount.toLocaleString()
        : "－";
  }


  if (
    resultOwnFundsElement
  ) {
    resultOwnFundsElement.textContent =
      hasValue(
        ownFundsInput
      )
        ? ownFunds.toLocaleString()
        : "－";
  }


  if (
    resultYearsElement
  ) {
    resultYearsElement.textContent =
      hasValue(
        repaymentYearsInput
      )
        ? repaymentYears.toLocaleString()
        : "－";
  }


  if (
    resultRateElement
  ) {
    resultRateElement.textContent =
      hasValue(
        interestRateInput
      )
        ? annualInterestRate.toLocaleString()
        : "－";
  }


  /* =========================
     土地マイナス警告
  ========================= */

  if (
    budgetWarningElement
  ) {
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


  if (
    chartTotalBudgetElement
  ) {
    chartTotalBudgetElement.textContent =
      hasTotalBudget
        ? totalBudget.toLocaleString()
        : "－";
  }


  /*
    円グラフの建物価格も
    税込価格を使用
  */

  if (
    chartBuildingPriceElement
  ) {
    chartBuildingPriceElement.textContent =
      buildingPriceTaxIncluded.toLocaleString();
  }


  if (
    chartLandPriceElement
  ) {
    chartLandPriceElement.textContent =
      hasTotalBudget
        ? Math.max(
            landPrice,
            0
          ).toLocaleString()
        : "－";
  }


  if (
    chartOtherPriceElement
  ) {
    chartOtherPriceElement.textContent =
      totalCosts.toLocaleString();
  }


  if (
    chartElement &&
    totalBudget > 0 &&
    landPrice >= 0
  ) {

    /*
      建物割合も税込価格
    */

    const buildingPercent =
      buildingPriceTaxIncluded /
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


    /*
      グラフ内の金額
    */

    if (
      buildingChartAmount
    ) {
      buildingChartAmount.textContent =
        buildingPriceTaxIncluded.toLocaleString();
    }


    if (
      landChartAmount
    ) {
      landChartAmount.textContent =
        landPrice.toLocaleString();
    }


    if (
      costChartAmount
    ) {
      costChartAmount.textContent =
        totalCosts.toLocaleString();
    }


    /*
      グラフ内ラベル位置
    */

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


    /*
      0円ならラベルを非表示
    */

    if (
      buildingChartLabel
    ) {
      buildingChartLabel.style.display =
        buildingPriceTaxIncluded > 0
          ? "flex"
          : "none";
    }


    if (
      landChartLabel
    ) {
      landChartLabel.style.display =
        landPrice > 0
          ? "flex"
          : "none";
    }


    if (
      costChartLabel
    ) {
      costChartLabel.style.display =
        totalCosts > 0
          ? "flex"
          : "none";
    }

  } else if (
    chartElement
  ) {

    chartElement.style.background =
      "#e5e7eb";


    [
      buildingChartLabel,
      landChartLabel,
      costChartLabel
    ].forEach(
      (label) => {

        if (label) {
          label.style.display =
            "none";
        }

      }
    );
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

if (
  addCostButton
) {

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

if (
  otherCostList
) {

  otherCostList.addEventListener(
    "click",
    (event) => {

      const deleteButton =
        event.target.closest(
          ".delete-cost-button"
        );


      if (
        !deleteButton
      ) {
        return;
      }


      const row =
        deleteButton.closest(
          ".other-cost-row"
        );


      if (
        row
      ) {

        row.remove();

        calculate();

      }

    }
  );
}


/* =========================
   リセット
========================= */

if (
  resetButton
) {

  resetButton.addEventListener(
    "click",
    () => {

      /*
        ユーザーが入力する
        基本項目を空に戻す
      */

      [
        rentInput,
        additionalPaymentInput,
        ownFundsInput,
        repaymentYearsInput,
        interestRateInput,
        buildingPriceInput
      ].forEach(
        (input) => {

          if (input) {
            input.value = "";

            input.classList.remove(
              "input-error"
            );
          }

        }
      );


      /*
        諸経費は
        デフォルト200万円へ戻す
      */

      if (
        expensesInput
      ) {
        expensesInput.value =
          DEFAULT_EXPENSES;

        expensesInput.classList.remove(
          "input-error"
        );
      }


      /*
        その他費用も
        デフォルト値へ戻す
      */

      const otherCostInputs =
        document.querySelectorAll(
          ".other-cost-amount"
        );


      otherCostInputs.forEach(
        (input, index) => {

          if (
            DEFAULT_OTHER_COSTS[index] !==
            undefined
          ) {
            input.value =
              DEFAULT_OTHER_COSTS[index];
          } else {
            input.value = "";
          }


          input.classList.remove(
            "input-error"
          );

        }
      );


      if (
        validationSummaryElement
      ) {

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
   土地エリアデータ
========================= */

function createLandAreaId() {
  return (
    "area-" +
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}

function loadLandAreas() {
  try {
    const saved =
      localStorage.getItem(
        LAND_AREAS_STORAGE_KEY
      );

    if (!saved) {
      landAreas = [];
      return;
    }

    const parsed =
      JSON.parse(saved);

    landAreas =
      Array.isArray(parsed)
        ? parsed
        : [];
  } catch (error) {
    landAreas = [];
  }
}

function saveLandAreas() {
  localStorage.setItem(
    LAND_AREAS_STORAGE_KEY,
    JSON.stringify(landAreas)
  );
}

function getLandAreaById(areaId) {
  return landAreas.find(
    (area) =>
      area.id === areaId
  );
}

function formatAreaLocation(area) {
  const hasLocation =
    Number.isFinite(
      Number(area.lat)
    ) &&
    Number.isFinite(
      Number(area.lng)
    );

  if (!hasLocation) {
    return "地図位置：未設定";
  }

  const radiusKm =
    Number.isFinite(
      Number(area.radius)
    )
      ? Number(area.radius) / 1000
      : 1.5;

  return (
    "地図位置：" +
    Number(area.lat).toFixed(5) +
    ", " +
    Number(area.lng).toFixed(5) +
    " / 半径 " +
    radiusKm.toLocaleString() +
    " km"
  );
}


/* =========================
   土地エリア編集表示
========================= */

function renderLandAreaEditors() {
  if (!landAreaListElement) {
    return;
  }

  landAreaListElement.innerHTML =
    "";

  if (landAreas.length === 0) {
    landAreaListElement.innerHTML = `
      <div class="land-area-empty">
        まだエリアが登録されていません。<br>
        「＋ エリアを追加」から登録してください。
      </div>
    `;
    return;
  }

  landAreas.forEach(
    (area) => {

      const editor =
        document.createElement(
          "div"
        );

      editor.className =
        "land-area-editor";

      editor.dataset.areaId =
        area.id;

      editor.innerHTML = `
        <div class="land-area-editor-grid">

          <div class="land-area-field">
            <label>エリア名</label>
            <input
              type="text"
              class="land-area-name"
              value="${escapeHtml(area.name || "")}"
              placeholder="例：松江市○○町"
            >
          </div>

          <div class="land-area-field">
            <label>土地最低価格</label>
            <input
              type="number"
              min="0"
              class="land-area-min-price"
              value="${numberValue(area.minPrice)}"
              placeholder="800"
            >
          </div>

          <div class="land-area-field">
            <label>土地最高価格</label>
            <input
              type="number"
              min="0"
              class="land-area-max-price"
              value="${numberValue(area.maxPrice)}"
              placeholder="1200"
            >
          </div>

          <div class="land-area-field">
            <label>坪単価 最低</label>
            <input
              type="number"
              min="0"
              step="0.1"
              class="land-area-min-tsubo"
              value="${numberValue(area.minTsubo)}"
              placeholder="18"
            >
          </div>

          <div class="land-area-field">
            <label>坪単価 最高</label>
            <input
              type="number"
              min="0"
              step="0.1"
              class="land-area-max-tsubo"
              value="${numberValue(area.maxTsubo)}"
              placeholder="22"
            >
          </div>

        </div>

        <div class="land-area-editor-actions">
          <div class="land-area-location-status">
            ${escapeHtml(formatAreaLocation(area))}
          </div>

          <div class="land-area-action-buttons">
            <button
              type="button"
              class="select-area-location-button"
            >
              地図で範囲を設定
            </button>

            <button
              type="button"
              class="delete-land-area-button"
            >
              削除
            </button>
          </div>
        </div>
      `;

      landAreaListElement.appendChild(
        editor
      );
    }
  );
}

function numberValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numericOrNull(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function updateLandAreaFromEditor(
  editor
) {
  const areaId =
    editor?.dataset.areaId;

  const area =
    getLandAreaById(
      areaId
    );

  if (!area) {
    return;
  }

  area.name =
    editor
      .querySelector(
        ".land-area-name"
      )
      ?.value
      .trim() || "";

  area.minPrice =
    numericOrNull(
      editor
        .querySelector(
          ".land-area-min-price"
        )
        ?.value
    );

  area.maxPrice =
    numericOrNull(
      editor
        .querySelector(
          ".land-area-max-price"
        )
        ?.value
    );

  area.minTsubo =
    numericOrNull(
      editor
        .querySelector(
          ".land-area-min-tsubo"
        )
        ?.value
    );

  area.maxTsubo =
    numericOrNull(
      editor
        .querySelector(
          ".land-area-max-tsubo"
        )
        ?.value
    );

  saveLandAreas();
  updateLandAreaCandidates();
}


/* =========================
   地図
========================= */

function canUseLeaflet() {
  return (
    typeof L !== "undefined"
  );
}

function initializeAreaSettingMap() {
  if (
    areaSettingMap ||
    !areaSettingMapElement ||
    !canUseLeaflet()
  ) {
    return;
  }

  areaSettingMap =
    L.map(
      areaSettingMapElement
    ).setView(
      DEFAULT_MAP_CENTER,
      DEFAULT_MAP_ZOOM
    );

  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(
    areaSettingMap
  );

  areaSettingMap.on(
    "click",
    (event) => {

      if (!selectedAreaId) {
        if (
          mapSettingGuideElement
        ) {
          mapSettingGuideElement.textContent =
            "先にエリアの「地図で範囲を設定」を押してください。";
        }
        return;
      }

      pendingAreaLat =
        Number(
          event.latlng.lat.toFixed(6)
        );

      pendingAreaLng =
        Number(
          event.latlng.lng.toFixed(6)
        );

      showPendingAreaRange();
      updateAreaRangeControlState();
    }
  );
}

function getAreaRadiusMeters(area) {
  const radius =
    Number(area?.radius);

  return (
    Number.isFinite(radius) &&
    radius >= 200
  )
    ? radius
    : 1500;
}

function showPendingAreaRange() {
  if (
    !areaSettingMap ||
    !Number.isFinite(
      Number(pendingAreaLat)
    ) ||
    !Number.isFinite(
      Number(pendingAreaLng)
    )
  ) {
    return;
  }

  const latLng = [
    Number(pendingAreaLat),
    Number(pendingAreaLng)
  ];

  if (areaSettingMarker) {
    areaSettingMarker.setLatLng(
      latLng
    );
  } else {
    areaSettingMarker =
      L.marker(
        latLng
      ).addTo(
        areaSettingMap
      );
  }

  if (areaSettingCircle) {
    areaSettingCircle
      .setLatLng(
        latLng
      )
      .setRadius(
        pendingAreaRadius
      );
  } else {
    areaSettingCircle =
      L.circle(
        latLng,
        {
          radius:
            pendingAreaRadius,
          weight: 2,
          fillOpacity: 0.14
        }
      ).addTo(
        areaSettingMap
      );
  }

  const area =
    getLandAreaById(
      selectedAreaId
    );

  areaSettingMarker
    .bindPopup(
      escapeHtml(
        area?.name ||
        "選択中のエリア"
      )
    );

  if (
    selectedAreaLocationElement
  ) {
    selectedAreaLocationElement.textContent =
      "中心地点：" +
      Number(pendingAreaLat).toFixed(5) +
      ", " +
      Number(pendingAreaLng).toFixed(5);
  }

  if (
    saveAreaRangeButton
  ) {
    saveAreaRangeButton.disabled =
      false;
  }
}

function showAreaSettingMarker(
  area
) {
  if (
    !areaSettingMap ||
    !Number.isFinite(
      Number(area?.lat)
    ) ||
    !Number.isFinite(
      Number(area?.lng)
    )
  ) {
    return;
  }

  pendingAreaLat =
    Number(area.lat);

  pendingAreaLng =
    Number(area.lng);

  pendingAreaRadius =
    getAreaRadiusMeters(
      area
    );

  syncRadiusControls();
  showPendingAreaRange();

  areaSettingMap.fitBounds(
    areaSettingCircle.getBounds(),
    {
      padding: [30, 30],
      maxZoom: 14
    }
  );
}

function syncRadiusControls() {
  const radiusKm =
    Math.round(
      pendingAreaRadius / 100
    ) / 10;

  if (areaRadiusSlider) {
    areaRadiusSlider.value =
      String(radiusKm);
  }

  if (areaRadiusInput) {
    areaRadiusInput.value =
      String(radiusKm);
  }

  if (
    areaRadiusValueElement
  ) {
    areaRadiusValueElement.textContent =
      radiusKm.toLocaleString();
  }
}

function setPendingRadiusKm(value) {
  const radiusKm =
    Math.min(
      10,
      Math.max(
        0.2,
        Number(value) || 1.5
      )
    );

  pendingAreaRadius =
    Math.round(
      radiusKm * 1000
    );

  syncRadiusControls();

  if (areaSettingCircle) {
    areaSettingCircle.setRadius(
      pendingAreaRadius
    );
  }
}

function updateAreaRangeControlState() {
  const area =
    getLandAreaById(
      selectedAreaId
    );

  if (
    areaRangeControlsElement
  ) {
    areaRangeControlsElement.hidden =
      !area;
  }

  if (
    selectedAreaNameElement
  ) {
    selectedAreaNameElement.textContent =
      area?.name ||
      "名称未設定のエリア";
  }

  if (
    !Number.isFinite(
      Number(pendingAreaLat)
    ) ||
    !Number.isFinite(
      Number(pendingAreaLng)
    )
  ) {
    if (
      selectedAreaLocationElement
    ) {
      selectedAreaLocationElement.textContent =
        "地図上で中心地点をクリックしてください。";
    }

    if (
      saveAreaRangeButton
    ) {
      saveAreaRangeButton.disabled =
        true;
    }
  }

  syncRadiusControls();
}

function clearAreaRangeSelection() {
  selectedAreaId = null;
  pendingAreaLat = null;
  pendingAreaLng = null;
  pendingAreaRadius = 1500;

  if (areaSettingMarker) {
    areaSettingMarker.remove();
    areaSettingMarker = null;
  }

  if (areaSettingCircle) {
    areaSettingCircle.remove();
    areaSettingCircle = null;
  }

  if (
    areaRangeControlsElement
  ) {
    areaRangeControlsElement.hidden =
      true;
  }

  if (
    mapSettingGuideElement
  ) {
    mapSettingGuideElement.textContent =
      "エリアの「地図で範囲を設定」を押してから、地図上で中心地点を選んでください。";
  }
}

function initializeCandidateMap() {
  if (
    candidateMap ||
    !candidateMapElement ||
    !canUseLeaflet()
  ) {
    return;
  }

  candidateMap =
    L.map(
      candidateMapElement
    ).setView(
      DEFAULT_MAP_CENTER,
      DEFAULT_MAP_ZOOM
    );

  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(
    candidateMap
  );
}

function clearCandidateMarkers() {
  candidateMarkers.forEach(
    (marker) => {
      marker.remove();
    }
  );

  candidateMarkers = [];
}

function updateCandidateMap(
  candidates
) {
  initializeCandidateMap();

  if (!candidateMap) {
    return;
  }

  clearCandidateMarkers();

  const locatedCandidates =
    candidates.filter(
      (area) =>
        Number.isFinite(
          Number(area.lat)
        ) &&
        Number.isFinite(
          Number(area.lng)
        )
    );

  if (
    locatedCandidates.length === 0
  ) {
    candidateMap.setView(
      DEFAULT_MAP_CENTER,
      DEFAULT_MAP_ZOOM
    );
    return;
  }

  const visibleLayers = [];

  locatedCandidates.forEach(
    (area) => {

      const latLng = [
        Number(area.lat),
        Number(area.lng)
      ];

      const radius =
        getAreaRadiusMeters(
          area
        );

      const popupHtml = `
        <strong>
          ${escapeHtml(
            area.name ||
            "名称未設定"
          )}
        </strong>
        <br>
        土地価格：
        ${formatRange(
          area.minPrice,
          area.maxPrice
        )}
        万円
        <br>
        坪単価：
        ${formatRange(
          area.minTsubo,
          area.maxTsubo
        )}
        万円/坪
        <br>
        範囲：半径
        ${(radius / 1000).toLocaleString()} km
      `;

      const circle =
        L.circle(
          latLng,
          {
            radius,
            weight: 2,
            fillOpacity: 0.14
          }
        ).addTo(
          candidateMap
        );

      const marker =
        L.marker(
          latLng
        ).addTo(
          candidateMap
        );

      circle.bindPopup(
        popupHtml
      );

      marker.bindPopup(
        popupHtml
      );

      candidateMarkers.push(
        circle,
        marker
      );

      visibleLayers.push(
        circle
      );
    }
  );

  const group =
    L.featureGroup(
      visibleLayers
    );

  candidateMap.fitBounds(
    group.getBounds(),
    {
      padding: [35, 35],
      maxZoom: 14
    }
  );

  setTimeout(
    () => {
      candidateMap.invalidateSize();
    },
    0
  );
}


/* =========================
   土地候補判定
========================= */

function isValidAreaPriceRange(
  area
) {
  const minPrice =
    Number(area.minPrice);

  const maxPrice =
    Number(area.maxPrice);

  return (
    area.minPrice !== null &&
    area.maxPrice !== null &&
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    minPrice >= 0 &&
    maxPrice >= minPrice
  );
}

function getMatchingLandAreas(
  landPrice
) {
  return landAreas.filter(
    (area) => {

      if (
        !isValidAreaPriceRange(
          area
        )
      ) {
        return false;
      }

      return (
        landPrice >=
          Number(area.minPrice) &&
        landPrice <=
          Number(area.maxPrice)
      );
    }
  );
}

function formatRange(
  minValue,
  maxValue
) {
  if (
    minValue === null ||
    maxValue === null
  ) {
    return "未設定";
  }

  const min =
    Number(minValue);

  const max =
    Number(maxValue);

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return "未設定";
  }

  return (
    min.toLocaleString() +
    "〜" +
    max.toLocaleString()
  );
}

function updateLandAreaCandidates() {
  if (
    candidateLandBudgetElement
  ) {
    candidateLandBudgetElement.textContent =
      currentLandPrice === null
        ? "－"
        : currentLandPrice.toLocaleString();
  }

  if (
    !landCandidateListElement ||
    !landCandidateMessageElement
  ) {
    return;
  }

  landCandidateListElement.innerHTML =
    "";

  if (
    currentLandPrice === null
  ) {
    landCandidateMessageElement.hidden =
      false;

    landCandidateMessageElement.classList.remove(
      "is-empty"
    );

    landCandidateMessageElement.textContent =
      "土地価格を算出すると、条件に合うエリアが表示されます。";

    updateCandidateMap(
      []
    );
    return;
  }

  if (
    currentLandPrice < 0
  ) {
    landCandidateMessageElement.hidden =
      false;

    landCandidateMessageElement.classList.add(
      "is-empty"
    );

    landCandidateMessageElement.textContent =
      "土地価格がマイナスのため、候補エリアを表示できません。";

    updateCandidateMap(
      []
    );
    return;
  }

  const candidates =
    getMatchingLandAreas(
      currentLandPrice
    );

  if (
    candidates.length === 0
  ) {
    landCandidateMessageElement.hidden =
      false;

    landCandidateMessageElement.classList.add(
      "is-empty"
    );

    landCandidateMessageElement.textContent =
      "現在の土地予算に該当する登録エリアはありません。";

    updateCandidateMap(
      []
    );
    return;
  }

  landCandidateMessageElement.hidden =
    true;

  landCandidateMessageElement.classList.remove(
    "is-empty"
  );

  candidates.forEach(
    (area) => {

      const item =
        document.createElement(
          "article"
        );

      item.className =
        "land-candidate-item";

      item.innerHTML = `
        <h3>
          ${escapeHtml(
            area.name ||
            "名称未設定"
          )}
        </h3>

        <div class="land-candidate-detail">
          <span>土地価格目安</span>
          <strong>
            ${formatRange(
              area.minPrice,
              area.maxPrice
            )}
            万円
          </strong>
        </div>

        <div class="land-candidate-detail">
          <span>坪単価目安</span>
          <strong>
            ${formatRange(
              area.minTsubo,
              area.maxTsubo
            )}
            万円/坪
          </strong>
        </div>

        <div class="land-candidate-detail">
          <span>表示範囲</span>
          <strong>
            半径
            ${(getAreaRadiusMeters(area) / 1000).toLocaleString()}
            km
          </strong>
        </div>
      `;

      landCandidateListElement.appendChild(
        item
      );
    }
  );

  updateCandidateMap(
    candidates
  );
}


/* =========================
   土地エリア操作
========================= */

if (
  addLandAreaButton
) {
  addLandAreaButton.addEventListener(
    "click",
    () => {

      const newArea = {
        id:
          createLandAreaId(),
        name: "",
        minPrice: null,
        maxPrice: null,
        minTsubo: null,
        maxTsubo: null,
        lat: null,
        lng: null,
        radius: 1500
      };

      landAreas.push(
        newArea
      );

      saveLandAreas();
      renderLandAreaEditors();

      landAreaListElement
        ?.querySelector(
          `[data-area-id="${newArea.id}"] .land-area-name`
        )
        ?.focus();
    }
  );
}

if (
  landAreaListElement
) {
  landAreaListElement.addEventListener(
    "input",
    (event) => {

      const editor =
        event.target.closest(
          ".land-area-editor"
        );

      if (!editor) {
        return;
      }

      updateLandAreaFromEditor(
        editor
      );
    }
  );

  landAreaListElement.addEventListener(
    "click",
    (event) => {

      const editor =
        event.target.closest(
          ".land-area-editor"
        );

      if (!editor) {
        return;
      }

      const areaId =
        editor.dataset.areaId;

      const area =
        getLandAreaById(
          areaId
        );

      if (!area) {
        return;
      }

      if (
        event.target.closest(
          ".delete-land-area-button"
        )
      ) {
        landAreas =
          landAreas.filter(
            (item) =>
              item.id !== areaId
          );

        if (
          selectedAreaId ===
          areaId
        ) {
          selectedAreaId =
            null;

          if (
            areaSettingMarker
          ) {
            areaSettingMarker.remove();
            areaSettingMarker =
              null;
          }

          if (
            areaSettingCircle
          ) {
            areaSettingCircle.remove();
            areaSettingCircle =
              null;
          }

          if (
            areaRangeControlsElement
          ) {
            areaRangeControlsElement.hidden =
              true;
          }
        }

        saveLandAreas();
        renderLandAreaEditors();
        updateLandAreaCandidates();
        return;
      }

      if (
        event.target.closest(
          ".select-area-location-button"
        )
      ) {
        selectedAreaId =
          areaId;

        pendingAreaLat =
          Number.isFinite(
            Number(area.lat)
          )
            ? Number(area.lat)
            : null;

        pendingAreaLng =
          Number.isFinite(
            Number(area.lng)
          )
            ? Number(area.lng)
            : null;

        pendingAreaRadius =
          getAreaRadiusMeters(
            area
          );

        initializeAreaSettingMap();
        updateAreaRangeControlState();

        if (
          mapSettingGuideElement
        ) {
          mapSettingGuideElement.textContent =
            `${area.name || "名称未設定のエリア"}の範囲を設定中です。地図をクリックして中心地点を選び、円の大きさを調整してください。`;
        }

        if (
          pendingAreaLat !== null &&
          pendingAreaLng !== null
        ) {
          showAreaSettingMarker(
            area
          );
        } else {
          if (areaSettingMarker) {
            areaSettingMarker.remove();
            areaSettingMarker = null;
          }

          if (areaSettingCircle) {
            areaSettingCircle.remove();
            areaSettingCircle = null;
          }

          // 未設定のエリアは出雲市中心部から選び始める
          areaSettingMap?.setView(
            DEFAULT_MAP_CENTER,
            DEFAULT_MAP_ZOOM
          );
        }

        areaSettingMapElement
          ?.scrollIntoView(
            {
              behavior: "smooth",
              block: "center"
            }
          );
      }
    }
  );
}


/* =========================
   エリア範囲調整
========================= */

if (areaRadiusSlider) {
  areaRadiusSlider.addEventListener(
    "input",
    () => {
      setPendingRadiusKm(
        areaRadiusSlider.value
      );
    }
  );
}

if (areaRadiusInput) {
  areaRadiusInput.addEventListener(
    "input",
    () => {
      setPendingRadiusKm(
        areaRadiusInput.value
      );
    }
  );
}

if (saveAreaRangeButton) {
  saveAreaRangeButton.addEventListener(
    "click",
    () => {
      const area =
        getLandAreaById(
          selectedAreaId
        );

      if (
        !area ||
        !Number.isFinite(
          Number(pendingAreaLat)
        ) ||
        !Number.isFinite(
          Number(pendingAreaLng)
        )
      ) {
        return;
      }

      area.lat =
        Number(pendingAreaLat);

      area.lng =
        Number(pendingAreaLng);

      area.radius =
        Number(pendingAreaRadius);

      saveLandAreas();
      renderLandAreaEditors();
      updateLandAreaCandidates();

      if (
        mapSettingGuideElement
      ) {
        mapSettingGuideElement.textContent =
          `${area.name || "名称未設定のエリア"}の位置と範囲を保存しました。`;
      }

      clearAreaRangeSelection();
    }
  );
}

if (cancelAreaRangeButton) {
  cancelAreaRangeButton.addEventListener(
    "click",
    () => {
      clearAreaRangeSelection();
    }
  );
}


/* =========================
   折り畳みを開いたときに
   地図サイズを再計算
========================= */

const landAreaSettingsDetails =
  document.getElementById(
    "land-area-settings-details"
  );

const landCandidateDetails =
  document.getElementById(
    "land-candidate-details"
  );

if (landAreaSettingsDetails) {
  landAreaSettingsDetails.addEventListener(
    "toggle",
    () => {
      if (!landAreaSettingsDetails.open) {
        return;
      }

      initializeAreaSettingMap();

      setTimeout(
        () => {
          areaSettingMap?.invalidateSize();
        },
        0
      );
    }
  );
}

if (landCandidateDetails) {
  landCandidateDetails.addEventListener(
    "toggle",
    () => {
      if (!landCandidateDetails.open) {
        return;
      }

      initializeCandidateMap();
      updateLandAreaCandidates();

      setTimeout(
        () => {
          candidateMap?.invalidateSize();
        },
        0
      );
    }
  );
}


/* =========================
   土地エリア初期化
========================= */

loadLandAreas();
renderLandAreaEditors();

initializeAreaSettingMap();
initializeCandidateMap();

setTimeout(
  () => {
    areaSettingMap
      ?.invalidateSize();

    candidateMap
      ?.invalidateSize();
  },
  0
);


/* =========================
   初期表示
========================= */

calculate();