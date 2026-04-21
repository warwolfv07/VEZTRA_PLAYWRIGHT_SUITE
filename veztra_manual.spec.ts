import {test, expect} from '@playwright/test'

test.describe('Module 1 - Homepage',()=>{
   test('Homepage - all checks', async({page})=>{
        await page.goto('https://veztra.in');
        await expect(page).toHaveTitle(/Veztra Luxe/); 

        await test.step('TC-001Page title contains "Veztra" and logo renders', async() =>{
            const visibleContainer = await page.locator('.elementor-sticky--active');
            const logo = await visibleContainer.getByRole('link', { name: 'VEZTRA LUXE PVT LTD' });
            await expect(logo).toBeVisible();
        });

        await test.step('TC-002 Navigation menu links present on page', async() =>{
            const NavLabels = ['HOME', 'COLLECTION', 'ABOUT', 'CONTACT'];
            for(const label of NavLabels){
                const NavLink = await page.getByRole('link', { name: label, exact: true });
                await expect(NavLink).toBeVisible();
                await expect(NavLink).toBeEnabled();

            }
        });        
        
   }); 
});
