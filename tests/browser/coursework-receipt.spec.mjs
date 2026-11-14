import {test,expect} from "@playwright/test";
test("retired .org University pages never expose coursework or protected student records",async({page})=>{
 for(const path of ["/campus.html","/university-campus.html","/university.html","/university-enrollment.html"]){
  const body=await (await page.request.get(path)).text();
  expect(body).toContain("url=https://nblschool.com/");
  for(const marker of ["data-coursework-pdf","data-campus hidden","data-coursework-status","data-social-messages","Registrar rail","Your digital materials","billing/checkout","data-nbl-university-interest-form"]){
   expect(body).not.toContain(marker);
  }
 }
});
