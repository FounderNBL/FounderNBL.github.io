import {test,expect} from "@playwright/test";

test("old .org University routes no longer expose coursework or student records",async({page})=>{
  for(const oldPath of ["/campus.html","/university-campus.html"]){
    const body=await (await page.request.get(oldPath)).text();
    expect(body).toContain('url=https://nblschool.com/');
    for(const marker of ["data-coursework-pdf","data-campus hidden","data-coursework-status","data-social-messages","Registrar rail","Your digital materials"]){
      expect(body).not.toContain(marker);
    }
  }
  const arrival=await (await page.request.get("/university.html")).text();
  expect(arrival).toContain('url=https://nblschool.com/');
  expect(arrival).not.toContain("data-coursework-pdf");
  expect(arrival).not.toContain("data-nbl-university-interest-form");
  const notices=await (await page.request.get("/university-updates.html")).text();
  expect(notices).toContain("The school is under construction.");
  expect(notices).toContain("we are not accepting tuition");
  expect(notices).toContain("Sign up for free opening updates");
  expect(notices).toContain("data-nbl-university-interest-form");
  expect(notices).not.toContain("Sign up &amp; continue to payment");
  expect(notices).not.toContain("data-coursework-pdf");
});
