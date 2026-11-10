import {test,expect} from "@playwright/test";

test("old .org University routes no longer expose coursework or student records",async({page})=>{
  for(const oldPath of ["/campus.html","/university-campus.html"]){
    const body=await (await page.request.get(oldPath)).text();
    expect(body).toContain('url=https://nblschool.com/');
    for(const marker of ["data-coursework-pdf","data-campus hidden","data-coursework-status","data-social-messages","Registrar rail","Your digital materials"]){
      expect(body).not.toContain(marker);
    }
  }
  const admission=await (await page.request.get("/university.html")).text();
  // .org only advertises FREE notifications while NBL University is closed.
  // Checkout, tuition and coursework must not leak into the public landing page.
  expect(admission).toContain("The school is under construction.");
  expect(admission).toContain("we are not accepting tuition");
  expect(admission).toContain("Sign up for free opening updates");
  expect(admission).toContain("Join free notification list");
  expect(admission).toContain("data-nbl-university-interest-form");
  expect(admission).toContain('href="https://nblschool.com/"');
  expect(admission).not.toContain("Sign up &amp; continue to payment");
  expect(admission).not.toContain("data-coursework-pdf");
});