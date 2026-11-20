Below is the complete plain-text version of the requirements document. You can copy it into a file named `school-research-portal-requirements.md`.

# **SCHOOL MANAGEMENT RESEARCH PORTAL**

## **Product Requirements Document (PRD)**

**Project:** FAST Assignment 4 – Inside One Organization\
**Organization:** The Educators, Peshawar\
**Campuses:** Ring Road Campus and Kabootar Chowk Preschool\
**Purpose:** Collect, store, and review school management research responses digitally.

# **1. PROJECT OVERVIEW**

Build a professional, mobile-friendly web portal that allows authorized respondents from the two school campuses to submit answers to a management research questionnaire.

The portal will be used to collect information for a university assignment. It is not intended to replace the actual school visit, interviews, handwritten findings, organization chart, or other evidence required by the assignment.

The system will have two main parts:

1. Public questionnaire: Respondents can open a link, complete the questionnaire, and submit their answers without creating an account.
2. Private admin dashboard: The researcher can log in, view all submitted responses, filter them, inspect individual submissions, and export the data.

All submitted responses must be stored persistently in a database.

# **2. MAIN OBJECTIVES**

The website must:

- Make collecting research responses easy.
- Work properly on mobile phones, tablets, and computers.
- Support the two school campuses.
- Store every successful submission in a database.
- Allow the researcher to access submissions later.
- Organize answers according to the assignment's research requirements.
- Provide a professional and trustworthy interface.
- Protect respondents' information from unauthorized access.

# **3. RECOMMENDED TECHNOLOGY STACK**

Use the following technologies:

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend and database:

- Supabase
- PostgreSQL database
- Supabase authentication

Hosting:

\- Vercel

The application should use a clean, maintainable structure.

Do not expose private database credentials or service-role keys in frontend code.

# **4. WEBSITE STRUCTURE**

The website should contain the following pages:

1. Public landing page
2. Public questionnaire
3. Submission confirmation page
4. Private admin login page
5. Private admin dashboard
6. Individual submission details page

# **5. PUBLIC LANDING PAGE**

Create a professional landing page introducing the research questionnaire.

It should include:

- Project title: School Management Research
- Short explanation of the research purpose.
- Mention that the questionnaire is intended for school management and relevant staff.
- Campus selection or explanation that the respondent will select their campus in the questionnaire.
- Estimated completion time.
- Privacy statement.
- A prominent "Start Questionnaire" button.

Suggested introductory text:

"We are conducting academic research to understand how school management operates in practice. This questionnaire focuses on organizational structure, decision-making, performance measurement, recruitment, employee management, and operational challenges.

Your responses will be used for academic research purposes. Please provide accurate information based on your actual experience and knowledge."

The website must not imply that it is an official website of The Educators unless permission has been granted.

Do not use school logos or official branding without permission.

# **6. QUESTIONNAIRE REQUIREMENTS**

The questionnaire must be divided into logical sections.

Use a multi-step form rather than displaying all questions on one long page.

The interface should include:

- Progress indicator.
- Previous and Next buttons.
- Clearly displayed section titles.
- Proper input fields.
- Required-field validation where appropriate.
- Optional questions where appropriate.
- Ability to return to previous sections without losing answers.
- Final review screen before submission.

If a respondent does not know an answer, they should be able to select "Maloom nahi" (Don't know).

If a respondent refuses to answer, they should be able to select "Declined".

Do not force respondents to invent answers.

## **SECTION 1: BASIC ORGANIZATION INFORMATION**

Q1. Which campus are you answering questions about?

Options:

- Ring Road Campus
- Kabootar Chowk Preschool
- Both campuses

Q2. What is your current role?

Examples:

- Principal
- Vice Principal
- Academic Coordinator
- Teacher
- Administrative Staff
- Other

Q3. How involved are you in the management of this campus?

Options:

- Directly involved in management
- Somewhat involved
- Mostly involved in teaching or daily operations
- Not directly involved in management

Q4. Approximately how many employees work at this campus?

Options:

- 1–10
- 11–20
- 21–30
- 31–40
- 41–50
- More than 50
- Don't know

Q5. How familiar are you with the overall management structure?

Options:

- Very familiar
- Somewhat familiar
- Slightly familiar
- Not familiar

## **SECTION 2: F1 – DIVISION OF WORK**

Purpose: Understand how work is divided among departments or groups.

Q6. What departments or main working groups exist at this campus?

Allow multiple selections:

- Administration
- Teaching Staff
- Academic Coordination
- Accounts and Fee Management
- Admissions
- Examination and Assessment
- Support Staff
- Security
- Other

Q7. Approximately how many employees work in each department?

Provide repeatable fields:

Department name:\
Approximate employee count:

Allow respondents to add multiple departments.

Q8. Who is responsible for managing each department or group?

Allow respondents to specify:

Department:\
Responsible person's role:

Q9. Does each department have a separate supervisor or manager?

Options:

- Yes
- No
- Some departments do
- Don't know

Additional explanation field.

## **SECTION 3: F2 – SPAN OF CONTROL**

Purpose: Understand how many employees report directly to managers at different levels.

Q10. Approximately how many employees report directly to the campus principal or head?

Input:

- Numerical answer
- Don't know
- Declined

Q11. Approximately how many employees report directly to the academic coordinator or teacher supervisor?

Input:

- Numerical answer
- Don't know
- Declined

Q12. How many management levels exist between ordinary employees and the person responsible for the campus?

Options:

- One level
- Two levels
- Three levels
- More than three levels
- Don't know

Additional explanation field.

Important: The respondent should identify direct reporting relationships, not simply count everyone working under a manager indirectly.

## **SECTION 4: F3 – DECISION-MAKING**

Purpose: Understand which decisions can be made independently and which require approval.

Q13. Give one example of a decision that a campus manager or department head can make without asking higher management for approval.

Long-text answer.

Q14. Give one example of a decision that requires approval from higher management.

Long-text answer.

Q15. Who usually makes the final decision regarding the following?

- Hiring new employees
- Salary changes
- Major expenses
- Important academic decisions

Allow respondents to enter the responsible person's role for each item.

## **SECTION 5: F4 – PERFORMANCE MEASUREMENT**

Purpose: Understand how the organization measures employee and organizational performance.

Q16. What things does the school regularly monitor to evaluate performance?

Allow multiple selections:

- Student attendance
- Teacher attendance
- Fee collection
- New admissions
- Examination results
- Teacher performance
- Parent complaints
- Student academic progress
- Other

Q17. How frequently are these performance indicators reviewed?

Options:

- Daily
- Weekly
- Monthly
- Every term
- Annually
- Only when a problem occurs
- Other

Q18. Who checks performance, and what happens when performance is unsatisfactory?

Long-text answer.

The response should ideally explain:

- Who monitors performance?
- What happens when a problem is identified?
- Is feedback provided?
- Are corrective actions taken?

## **SECTION 6: F5 – RECRUITMENT**

Purpose: Understand the actual recruitment process used by the organization.

Q19. Think about the most recent employee hired at this campus. Describe the recruitment process in the order it happened.

Long-text answer.

Ask the respondent to explain the actual process, not the ideal or official process.

Q20. How was the candidate initially found?

Options:

- Online job advertisement
- Personal reference
- Existing employee recommendation
- Walk-in applicant
- Direct contact
- Other
- Don't know

Q21. Which of the following steps were involved in the recruitment process?

Allow multiple selections:

- CV screening
- Initial interview
- Teaching demonstration
- Subject knowledge test
- Reference checking
- Final interview
- Management approval
- Other

Q22. Who made the final hiring decision?

Long-text answer.

## **SECTION 7: F6 – EMPLOYEE MANAGEMENT**

Purpose: Understand how the organization manages, evaluates, motivates, and retains employees.

Q23. How does the school evaluate employee performance?

Allow multiple selections:

- Classroom observation
- Student examination results
- Employee attendance
- Parent feedback
- Principal evaluation
- Academic coordinator evaluation
- Formal performance reviews
- Other

Q24. What specific practices does the school use to motivate employees, retain good employees, improve performance, or manage employee pay?

Long-text answer.

Encourage respondents to provide actual examples.

## **SECTION 8: PART D – IDENTIFYING AN ORGANIZATIONAL PROBLEM**

Purpose: Identify one real operational problem and understand its possible causes.

Q25. What is one significant operational or management problem that currently affects this campus?

Long-text answer.

Q26. Which category best describes this problem?

Options:

- Communication
- Staff management
- Workload distribution
- Decision-making
- Recruitment
- Employee performance
- Student management
- Parent communication
- Financial or resource limitations
- Other

Q27. Can you describe a recent incident in which this problem affected the school's operations?

Ask for:

- What happened?
- Who or what was affected?
- What was the result?

Q28. How frequently does this problem occur?

Options:

- Daily
- Weekly
- Monthly
- Occasionally
- Rarely
- Don't know

Q29. What do you believe is the main reason behind this problem?

Allow the respondent to explain the main cause and, if possible, another possible explanation.

## **SECTION 9: PART E – RECOMMENDATIONS**

Purpose: Collect information that can help develop a practical recommendation.

Q30. Has the school previously tried to solve this problem?

Options:

- Yes
- No
- Don't know

If yes, describe what was attempted and what happened.

Q31. What change or improvement do you think would help solve this problem?

Long-text answer.

Q32. What resources would be required to implement this improvement?

Examples:

- Money
- Additional employees
- Staff training
- Software or technology
- Management time
- Better communication
- Other

Q33. What difficulties or disadvantages might arise from implementing this change?

Long-text answer.

Q34. How could the school measure whether the proposed improvement is successful?

Long-text answer.

Encourage measurable indicators rather than vague statements.

## **SECTION 10: PART F – ADDITIONAL FINDINGS**

Q35. Is there any information about the school's management that is difficult to find or is not formally recorded?

Long-text answer.

Q36. Is there any management practice at this school that surprised you because it works differently from what you would normally expect?

Long-text answer.

## **SECTION 11: ADDITIONAL INFORMATION**

Q37. Is there anything else about the management or daily operations of this campus that you think is important?

Long-text answer.

Q38. Would you be willing to answer a short follow-up question if clarification is needed?

Options:

- Yes
- No

# **7. FORM DESIGN AND USER EXPERIENCE**

The questionnaire should feel simple and comfortable to complete.

Use these design principles:

- One section at a time.
- Avoid overwhelming respondents with too many questions at once.
- Use radio buttons for single-choice answers.
- Use checkboxes for multiple-choice answers.
- Use text areas for detailed answers.
- Use number inputs for employee counts.
- Use dropdowns where appropriate.
- Display clear instructions.
- Highlight missing required answers.
- Preserve answers when navigating between sections.
- Allow the respondent to review answers before final submission.

Do not make every question compulsory. Some respondents may not know every aspect of school management.

For questions about specific incidents or processes, encourage factual examples rather than general opinions.

# **8. DATABASE REQUIREMENTS**

Use Supabase PostgreSQL to store questionnaire submissions.

Create a main table called:

`submissions`

Suggested columns:

- id: UUID, primary key
- created_at: timestamp
- campus: text
- respondent_role: text
- management_involvement: text
- employee_count: text
- management_familiarity: text
- answers: JSONB
- status: text, optional
- reference_code: text, optional

The `answers` column should contain the remaining questionnaire answers using stable question identifiers such as q6, q7, q8, and so on.

Example: