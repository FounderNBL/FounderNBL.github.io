import {test,expect} from "@playwright/test";

test("no Study Lab coursework is exposed on .org's retired campus",async({page})=>{
  const response=await page.request.get("/campus.html");
  const html=await response.text();
  expect(html).toContain("https://nblschool.com/");
  expect(html).not.toContain("data-study-save");
  expect(html).not.toContain("data-course-select");
  expect(html).not.toContain("data-school-office");
  const admissions=await page.request.get("/university.html");
  const copy=await admissions.text();
  expect(copy).not.toContain("Study Lab");
  expect(copy).not.toContain('data-campus');
});