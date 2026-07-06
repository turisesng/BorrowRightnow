/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { UserProfile, FinancialHealthScore, Debt } from '../types';

export function exportFinancialSummaryPdf(
  profile: UserProfile,
  healthScore: FinancialHealthScore | null,
  debts: Debt[],
  extraPayment: number,
  strategy: 'snowball' | 'avalanche'
) {
  // Initialize standard portrait A4 PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currentDate = new Date().toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Color Palette Constants
  const colors = {
    slateDark: [15, 23, 42],     // #0f172a (Slate 900)
    slateMedium: [71, 85, 105],  // #475569 (Slate 600)
    slateLight: [241, 245, 249], // #f1f5f9 (Slate 100)
    emeraldDark: [4, 120, 87],   // #047857 (Emerald 700)
    emeraldLight: [209, 250, 229], // #d1fae5 (Emerald 100)
    roseDark: [185, 28, 28],     // #b91c1c (Rose 700)
    roseLight: [254, 226, 226],  // #fee2e2 (Rose 100)
    borderGrey: [226, 232, 240], // #e2e8f0 (Slate 200)
    textGrey: [100, 116, 139],   // #64748b (Slate 500)
    white: [255, 255, 255],
  };

  // Helper function to draw section header
  const drawSectionHeader = (title: string, yPos: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
    doc.text(title, 15, yPos);
    
    // Bottom accent line
    doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 2, 195, yPos + 2);
  };

  // ----------------------------------------------------
  // PAGE 1: Header, Profile, and Health Assessment
  // ----------------------------------------------------

  // 1. Top Branding Header Bar
  doc.setFillColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
  doc.rect(15, 15, 180, 26, 'F');

  // Emerald bar accent inside the banner
  doc.setFillColor(colors.emeraldDark[0], colors.emeraldDark[1], colors.emeraldDark[2]);
  doc.rect(15, 39, 180, 1.5, 'F');

  // Title Text
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BORROWRIGHT AI', 22, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text('PREDATORY DEBT PREVENTION & ADVISORY REPORT', 22, 32);

  // Date box on the right of the header banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  doc.text('STATEMENT DATE', 150, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(currentDate, 150, 31);

  // 2. Profile Section
  const profileY = 50;
  drawSectionHeader('1. BORROWER PROFILE & KYC STATUS', profileY);

  // Draw light border box for Profile details
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
  doc.rect(15, profileY + 6, 180, 32, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);

  // Two Column Grid
  const col1X = 22;
  const col2X = 110;
  
  // Left Column profile info
  doc.setFont('helvetica', 'bold'); doc.text('Full Name:', col1X, profileY + 13);
  doc.setFont('helvetica', 'normal'); doc.text(profile.fullName || 'Not Specified', col1X + 22, profileY + 13);

  doc.setFont('helvetica', 'bold'); doc.text('Email:', col1X, profileY + 19);
  doc.setFont('helvetica', 'normal'); doc.text(profile.email || 'Not Specified', col1X + 22, profileY + 19);

  doc.setFont('helvetica', 'bold'); doc.text('Telephone:', col1X, profileY + 25);
  doc.setFont('helvetica', 'normal'); doc.text(profile.phone || 'Not Specified', col1X + 22, profileY + 25);

  doc.setFont('helvetica', 'bold'); doc.text('Location:', col1X, profileY + 31);
  doc.setFont('helvetica', 'normal'); doc.text(`${profile.city || ''}, ${profile.state || ''}`, col1X + 22, profileY + 31);

  // Right Column profile info
  doc.setFont('helvetica', 'bold'); doc.text('Employment:', col2X, profileY + 13);
  doc.setFont('helvetica', 'normal'); doc.text(`${profile.employmentStatus || 'Not Specified'} ${profile.employer ? `(${profile.employer})` : ''}`, col2X + 24, profileY + 13);

  doc.setFont('helvetica', 'bold'); doc.text('Occupation:', col2X, profileY + 19);
  doc.setFont('helvetica', 'normal'); doc.text(profile.occupation || 'Not Specified', col2X + 24, profileY + 19);

  doc.setFont('helvetica', 'bold'); doc.text('Monthly Income:', col2X, profileY + 25);
  doc.setFont('helvetica', 'normal'); doc.text(`NGN ${(profile.monthlyIncome || 0).toLocaleString()}`, col2X + 24, profileY + 25);

  doc.setFont('helvetica', 'bold'); doc.text('ID Verified:', col2X, profileY + 31);
  doc.setFont('helvetica', 'normal'); doc.text(`BVN: ${profile.bvn || 'Linked'} | NIN: Linked`, col2X + 24, profileY + 31);


  // 3. Health Assessment Score Section
  const healthY = 96;
  drawSectionHeader('2. FINANCIAL HEALTH & CREDIT SAFETY RATING', healthY);

  // Score evaluation fallback if they haven't calculated it in this session
  const activeScore = healthScore?.score ?? null;
  const isScorePresent = activeScore !== null;

  // Render health score card
  const cardX = 15;
  const cardY = healthY + 6;
  const cardW = 55;
  const cardH = 34;

  let scoreColor = colors.emeraldDark;
  let scoreLight = colors.emeraldLight;
  let ratingLabel = 'HEALTHY';
  let ratingDesc = 'Excellent';

  if (activeScore !== null) {
    if (activeScore >= 75) {
      scoreColor = colors.emeraldDark;
      scoreLight = colors.emeraldLight;
      ratingLabel = 'HEALTHY';
      ratingDesc = 'Low Risk Profile';
    } else if (activeScore >= 50) {
      scoreColor = [217, 119, 6]; // Amber 600
      scoreLight = [254, 243, 199]; // Amber 100
      ratingLabel = 'MODERATE';
      ratingDesc = 'Caution Advised';
    } else {
      scoreColor = colors.roseDark;
      scoreLight = colors.roseLight;
      ratingLabel = 'BURDENED';
      ratingDesc = 'Critical Debt Trap';
    }
  }

  // Draw Score Box with colored background
  doc.setFillColor(scoreLight[0], scoreLight[1], scoreLight[2]);
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(0.8);
  doc.rect(cardX, cardY, cardW, cardH, 'FD');

  if (isScorePresent) {
    // Large Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${activeScore}`, cardX + 13, cardY + 16);
    
    doc.setFontSize(10);
    doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
    doc.text('/ 100', cardX + 31, cardY + 13);

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(ratingLabel, cardX + 27, cardY + 24, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.slateMedium[0], colors.slateMedium[1], colors.slateMedium[2]);
    doc.text(ratingDesc, cardX + 27, cardY + 29, { align: 'center' });
  } else {
    // Fallback text if score not calculated
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.slateMedium[0], colors.slateMedium[1], colors.slateMedium[2]);
    doc.text('PENDING', cardX + 27, cardY + 15, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Run assessment in-app', cardX + 27, cardY + 22, { align: 'center' });
    doc.text('to calculate safety rating', cardX + 27, cardY + 26, { align: 'center' });
  }

  // Right side of score card: Individual ratios grid
  const gridX = 76;
  const gridW = 119;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
  doc.setLineWidth(0.5);
  doc.rect(gridX, cardY, gridW, cardH, 'FD');

  // Inside ratios text
  const cellW = gridW / 2;
  const cellH = cardH / 2;

  const drawRatioCell = (title: string, value: string, sub: string, x: number, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colors.textGrey[0], colors.textGrey[1], colors.textGrey[2]);
    doc.text(title.toUpperCase(), x + 4, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
    doc.text(value, x + 4, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(colors.slateMedium[0], colors.slateMedium[1], colors.slateMedium[2]);
    doc.text(sub, x + 4, y + 15);
  };

  // Get active ratio values
  const dtiVal = isScorePresent ? `${healthScore!.dti.toFixed(1)}%` : 'No Calculations';
  const dtiDesc = isScorePresent 
    ? (healthScore!.dti <= 33 ? 'Excellent (Safe)' : healthScore!.dti <= 50 ? 'Warning Limit' : 'Dangerous Burden')
    : 'Pending Analysis';

  const savingsVal = isScorePresent ? `${healthScore!.savingsRatio.toFixed(1)}%` : 'No Calculations';
  const savingsDesc = isScorePresent 
    ? (healthScore!.savingsRatio >= 15 ? 'Target Exceeded' : 'Under Safe Target')
    : 'Pending Analysis';

  const disposableVal = isScorePresent ? `NGN ${healthScore!.monthlyDisposableIncome.toLocaleString()}` : 'No Calculations';
  const disposableDesc = 'Available free liquidity';

  const emergencyVal = isScorePresent ? `${healthScore!.emergencyFundScore}/100` : 'No Calculations';
  const emergencyDesc = '3-Month reserve rating';

  // Draw cells
  drawRatioCell('Debt-To-Income (DTI)', dtiVal, dtiDesc, gridX, cardY);
  drawRatioCell('Savings Ratio', savingsVal, savingsDesc, gridX + cellW, cardY);
  drawRatioCell('Disposable Liquidity', disposableVal, disposableDesc, gridX, cardY + cellH);
  drawRatioCell('Emergency Fund Rating', emergencyVal, emergencyDesc, gridX + cellW, cardY + cellH);

  // Divider lines inside cell grid
  doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
  doc.line(gridX + cellW, cardY, gridX + cellW, cardY + cardH);
  doc.line(gridX, cardY + cellH, gridX + gridW, cardY + cellH);


  // 4. AI-Driven Coach Advice & Recommendations Box
  const coachY = healthY + 45;
  doc.setFillColor(250, 252, 250); // very soft emerald hue
  doc.setDrawColor(200, 230, 210);
  doc.setLineWidth(0.6);
  doc.rect(15, coachY, 180, 52, 'FD');

  // Title of coach advice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.emeraldDark[0], colors.emeraldDark[1], colors.emeraldDark[2]);
  doc.text('AI UNDERWRITING & DEBT REDUCTION DIRECTIVES', 20, coachY + 6);

  doc.setDrawColor(220, 240, 225);
  doc.setLineWidth(0.3);
  doc.line(20, coachY + 8, 190, coachY + 8);

  // Recommendations text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);

  let recommendationsList: string[] = [];
  if (isScorePresent && healthScore!.recommendations && healthScore!.recommendations.length > 0) {
    recommendationsList = healthScore!.recommendations;
  } else {
    // Fallbacks
    recommendationsList = [
      'Maintain an active Debt-to-Income (DTI) ratio strictly below 33% to qualify for regulated microfinance loans.',
      'Settle short-term unlicensed app loans immediately; their monthly rates (often 15%+) are usurious.',
      'Establish a persistent automatic savings sweep of at least 15% to build a robust emergency buffer.',
    ];
  }

  // Print recommendations as beautiful list
  let textY = coachY + 14;
  recommendationsList.forEach((rec, idx) => {
    // Draw green bullets
    doc.setFillColor(colors.emeraldDark[0], colors.emeraldDark[1], colors.emeraldDark[2]);
    doc.circle(23, textY - 1, 0.9, 'F');
    
    // Draw text with auto wrapping
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.emeraldDark[0], colors.emeraldDark[1], colors.emeraldDark[2]);
    doc.text(`[Directive ${idx + 1}]`, 28, textY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
    
    // Split text nicely
    const wrappedText = doc.splitTextToSize(rec, 150);
    doc.text(wrappedText, 48, textY);

    // Increment Y space dynamically depending on lines of recommendation
    textY += (wrappedText.length * 4.5) + 2.5;
  });


  // 5. Applet and security seal
  const footerY = coachY + 58;
  doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
  doc.line(15, footerY, 195, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textGrey[0], colors.textGrey[1], colors.textGrey[2]);
  doc.text('BORROWRIGHT ADVOCACY REPORT • STRICTLY CONFIDENTIAL', 15, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text('Page 1 of 2', 180, footerY + 5);


  // ----------------------------------------------------
  // PAGE 2: Active Debt Portfolio and Strategy Simulation
  // ----------------------------------------------------
  doc.addPage();

  // Draw Page 2 Header Bar
  doc.setFillColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
  doc.rect(15, 15, 180, 10, 'F');

  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LIABILITIES PORTFOLIO & DEBT ACCELERATION SUMMARY', 20, 21.5);

  // Subheader title dates
  doc.setFontSize(8);
  doc.setTextColor(190, 190, 190);
  doc.text(`Borrower: ${profile.fullName || 'User'}`, 135, 21.5);

  // 1. Debt table Section
  const debtTableY = 32;
  drawSectionHeader('3. DETAILED ACTIVE LIABILITIES PORTFOLIO', debtTableY);

  // Table Headers layout
  const tableY = debtTableY + 6;
  const colWidths = {
    lender: 55,
    principal: 27,
    rate: 22,
    installment: 27,
    term: 20,
    due: 24,
  };

  const colPositions = {
    lender: 15,
    principal: 15 + colWidths.lender,
    rate: 15 + colWidths.lender + colWidths.principal,
    installment: 15 + colWidths.lender + colWidths.principal + colWidths.rate,
    term: 15 + colWidths.lender + colWidths.principal + colWidths.rate + colWidths.installment,
    due: 15 + colWidths.lender + colWidths.principal + colWidths.rate + colWidths.installment + colWidths.term,
  };

  // Draw table header block
  doc.setFillColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
  doc.rect(15, tableY, 180, 7.5, 'F');

  // Write headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);

  doc.text('Lending Institution', colPositions.lender + 3, tableY + 5);
  doc.text('Principal Balance', colPositions.principal + 3, tableY + 5);
  doc.text('Rate (Mo.)', colPositions.rate + 3, tableY + 5);
  doc.text('Mo. Payment', colPositions.installment + 3, tableY + 5);
  doc.text('Term Left', colPositions.term + 3, tableY + 5);
  doc.text('Next Due', colPositions.due + 3, tableY + 5);

  // Total accumulators
  let totalOutstanding = 0;
  let totalCommitment = 0;

  // Render Table Rows
  let rowY = tableY + 7.5;
  doc.setFontSize(8);

  if (debts.length > 0) {
    debts.forEach((debt, idx) => {
      totalOutstanding += debt.amount;
      totalCommitment += debt.monthlyPayment;

      // Zebra striping
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
      }
      doc.rect(15, rowY, 180, 8.5, 'F');

      // Borders
      doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
      doc.setLineWidth(0.3);
      doc.rect(15, rowY, 180, 8.5, 'S');

      // Highlight row if interest is predatory (> 8.0%)
      const isPredatory = debt.interestRate >= 8.0;
      if (isPredatory) {
        // Light warning border on left side of cell
        doc.setFillColor(colors.roseLight[0], colors.roseLight[1], colors.roseLight[2]);
        doc.rect(15, rowY, 3, 8.5, 'F');
      }

      // Write values
      doc.setFont('helvetica', isPredatory ? 'bold' : 'normal');
      doc.setTextColor(isPredatory ? colors.roseDark[0] : colors.slateDark[0], isPredatory ? colors.roseDark[1] : colors.slateDark[1], isPredatory ? colors.roseDark[2] : colors.slateDark[2]);
      
      doc.text(debt.lenderName, colPositions.lender + 3, rowY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
      doc.text(`NGN ${debt.amount.toLocaleString()}`, colPositions.principal + 3, rowY + 5.5);
      doc.text(`${debt.interestRate.toFixed(1)}%`, colPositions.rate + 3, rowY + 5.5);
      doc.text(`NGN ${debt.monthlyPayment.toLocaleString()}`, colPositions.installment + 3, rowY + 5.5);
      doc.text(`${debt.remainingTerm} Mos`, colPositions.term + 3, rowY + 5.5);
      doc.text(debt.nextDueDate, colPositions.due + 3, rowY + 5.5);

      rowY += 8.5;
    });

    // Write Summary Row
    doc.setFillColor(colors.slateLight[0], colors.slateLight[1], colors.slateLight[2]);
    doc.rect(15, rowY, 180, 9, 'F');
    doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
    doc.rect(15, rowY, 180, 9, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
    doc.text('TOTAL DEBT PORTFOLIO', colPositions.lender + 3, rowY + 6);
    doc.text(`NGN ${totalOutstanding.toLocaleString()}`, colPositions.principal + 3, rowY + 6);
    doc.text('-', colPositions.rate + 3, rowY + 6);
    doc.text(`NGN ${totalCommitment.toLocaleString()}`, colPositions.installment + 3, rowY + 6);
    doc.text('-', colPositions.term + 3, rowY + 6);
    doc.text('-', colPositions.due + 3, rowY + 6);

    rowY += 15;
  } else {
    // Fallback if no debts listed
    doc.setFillColor(250, 250, 250);
    doc.rect(15, rowY, 180, 18, 'F');
    doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
    doc.rect(15, rowY, 180, 18, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.emeraldDark[0], colors.emeraldDark[1], colors.emeraldDark[2]);
    doc.text('CONGRATULATIONS: NO OUTSTANDING DEBT DETECTED', 15 + 22, rowY + 8, { align: 'left' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.slateMedium[0], colors.slateMedium[1], colors.slateMedium[2]);
    doc.text('You have a clean active liability profile. Keep up your excellent debt-free standard!', 15 + 22, rowY + 13, { align: 'left' });

    rowY += 25;
  }

  // 2. Repayment Strategy Acceleration details
  drawSectionHeader('4. CREDIT PAYOFF ACCELERATION STRATEGY', rowY);

  const strategyBoxY = rowY + 6;
  doc.setFillColor(248, 250, 254); // soft violet/blue hue
  doc.setDrawColor(200, 215, 245);
  doc.setLineWidth(0.6);
  doc.rect(15, strategyBoxY, 180, 50, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(29, 78, 216); // Blue 700
  doc.text(`PLAN STRUCTURE: ${strategy.toUpperCase()} PAYOFF PATHWAY`, 20, strategyBoxY + 6);

  doc.setDrawColor(219, 234, 254);
  doc.setLineWidth(0.3);
  doc.line(20, strategyBoxY + 8, 190, strategyBoxY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);

  const strategyExplanation = strategy === 'avalanche' 
    ? 'The Debt Avalanche strategy works by ranking debts in descending order of interest rate. You make the minimum mandatory payments on all loans, then throw all extra cash (your extra payment buffer) at the highest-interest loan. This minimizes total interest paid and saves maximum cash over the debt lifecycle.'
    : 'The Debt Snowball strategy works by ranking debts by smallest outstanding balance first. You pay the minimum mandatory payments on all loans, then focus your extra cash on the smallest balance first. This builds fast physiological momentum and psychological wins as you wipe out entire accounts completely.';

  // Split and print strategy explanation
  const wrappedExplanation = doc.splitTextToSize(strategyExplanation, 170);
  doc.text(wrappedExplanation, 20, strategyBoxY + 13);

  // Print extra payment metrics
  let metricY = strategyBoxY + 29;
  doc.setFont('helvetica', 'bold');
  doc.text('Accelerated Repayment Highlights:', 20, metricY);

  doc.setFont('helvetica', 'normal');
  doc.text(`• Standard Monthly Commitment: NGN ${totalCommitment.toLocaleString()}`, 22, metricY + 5);
  doc.text(`• Additional Extra Budget: NGN ${extraPayment.toLocaleString()} / Month`, 22, metricY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.emeraldDark[0], colors.emeraldDark[1], colors.emeraldDark[2]);
  doc.text(`• Elevated Accelerated Monthly Velocity: NGN ${(totalCommitment + extraPayment).toLocaleString()} / Month`, 22, metricY + 13);

  // List prioritization order if debts exist
  if (debts.length > 0) {
    const sorted = [...debts];
    if (strategy === 'avalanche') {
      sorted.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      sorted.sort((a, b) => a.amount - b.amount);
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.slateDark[0], colors.slateDark[1], colors.slateDark[2]);
    doc.text('Target Prioritization Sequence:', 110, metricY);

    sorted.forEach((item, index) => {
      doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
      doc.setTextColor(index === 0 ? colors.roseDark[0] : colors.slateDark[0], index === 0 ? colors.roseDark[1] : colors.slateDark[1], index === 0 ? colors.roseDark[2] : colors.slateDark[2]);
      
      const badge = index === 0 ? ' [ACCELERATING]' : '';
      doc.text(`${index + 1}. ${item.lenderName}${badge}`, 112, metricY + 5 + (index * 4));
    });
  }


  // 3. Bottom legal disclaimer and contact shaming details
  const regulatoryY = strategyBoxY + 58;
  drawSectionHeader('5. LEGAL SAFEGUARDS & REGULATORY REDRESS', regulatoryY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.slateMedium[0], colors.slateMedium[1], colors.slateMedium[2]);

  const advisoryBody = 'Under FCCPC Consumer Protection Guidelines in Nigeria, digital lending institutions are strictly forbidden from engaging in abusive recovery shaming, direct-contact book harvesting, and unauthorized social defamation. High-rate lenders (e.g. rates exceeding 10% monthly) are often operating outside Central Bank (CBN) licenses. If you are experiencing social harassment or extortionate compounded penalties, you should: (1) revoke device permissions for their mobile application, (2) submit a formal regulatory complain template using the BorrowRight Compliance Hub, or (3) report to legal@fccpc.gov.ng with transaction logs.';

  const wrappedAdvisory = doc.splitTextToSize(advisoryBody, 178);
  doc.text(wrappedAdvisory, 15, regulatoryY + 6);


  // Page 2 bottom footer
  const page2FooterY = 278;
  doc.setDrawColor(colors.borderGrey[0], colors.borderGrey[1], colors.borderGrey[2]);
  doc.line(15, page2FooterY, 195, page2FooterY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textGrey[0], colors.textGrey[1], colors.textGrey[2]);
  doc.text('BORROWRIGHT ADVOCACY REPORT • SECURED UNDERWRITING AUDITS', 15, page2FooterY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text('Page 2 of 2', 180, page2FooterY + 5);


  // Save / Download PDF file
  const safeFilename = `${profile.fullName?.trim().replace(/\s+/g, '_') || 'BorrowRight'}_Financial_Summary.pdf`;
  doc.save(safeFilename);
}
